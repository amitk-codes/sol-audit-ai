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

export type Explanation = {
  overview: string;
  instructions: { name: string; summary: string }[];
};

export function explainContract(source: string): Promise<Explanation> {
  return post<Explanation>("/explain", { source });
}

export type Finding = {
  title: string;
  severity: string;
  category: string;
  location: string;
  description: string;
  recommendation: string;
};
export type AuditReport = { summary: string; findings: Finding[] };

export function auditContract(source: string): Promise<AuditReport> {
  return post<AuditReport>("/audit", { source });
}
