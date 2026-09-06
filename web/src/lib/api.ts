const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type LoadedFile = { path: string; content: string };
export type Contract = { files: LoadedFile[]; combined: string; total_chars: number };

export const LENDITY_FI_REPO = "https://github.com/amitk-codes/lendity-fi";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

async function streamText(
  path: string,
  body: unknown,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? `Request failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export function loadContract(input: { source?: string; repo_url?: string }): Promise<Contract> {
  return post<Contract>("/contract/load", input);
}

// ---- explain (fan-out: an outline, then each instruction streams on its own) ----

export type ExplainOutline = { overview: string; instructions: string[] };

export function explainOutline(source: string): Promise<ExplainOutline> {
  return post<ExplainOutline>("/explain/outline", { source });
}

export function explainInstructionStream(
  source: string,
  name: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamText("/explain/instruction", { source, name }, onChunk, signal);
}

// ---- audit (fan-out: an outline of finding skeletons, then each detail streams) ----

export type FindingSkeleton = {
  title: string;
  severity: string;
  category: string;
  location: string;
};
export type AuditOutline = { summary: string; findings: FindingSkeleton[] };

export function auditOutline(source: string): Promise<AuditOutline> {
  return post<AuditOutline>("/audit/outline", { source });
}

export function auditFindingStream(
  source: string,
  finding: FindingSkeleton,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamText(
    "/audit/finding",
    { source, title: finding.title, category: finding.category, location: finding.location },
    onChunk,
    signal,
  );
}

// ---- chat ----

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function chatStream(
  source: string,
  question: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamText("/chat", { source, question, history }, onChunk, signal);
}
