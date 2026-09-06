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

export function loadContract(input: { source?: string; repo_url?: string }): Promise<Contract> {
  return post<Contract>("/contract/load", input);
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

// Consume a newline-delimited-JSON stream, parsing each complete line as it arrives.
async function streamNdjson(
  path: string,
  body: unknown,
  onObject: (obj: Record<string, unknown>) => void,
  signal?: AbortSignal,
): Promise<void> {
  let buffer = "";
  const flush = (chunk: string) => {
    buffer += chunk;
    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) {
        try {
          onObject(JSON.parse(line));
        } catch {
          // ignore partial or non-JSON lines
        }
      }
    }
  };
  await streamText(path, body, flush, signal);
  const last = buffer.trim();
  if (last) {
    try {
      onObject(JSON.parse(last));
    } catch {
      // ignore
    }
  }
}

export type Instruction = { name: string; summary: string };

export function explainStream(
  source: string,
  onObject: (obj: Record<string, unknown>) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamNdjson("/explain", { source }, onObject, signal);
}

export type Finding = {
  title: string;
  severity: string;
  category: string;
  location: string;
  description: string;
  recommendation: string;
};

export function auditStream(
  source: string,
  onObject: (obj: Record<string, unknown>) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamNdjson("/audit", { source }, onObject, signal);
}

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
