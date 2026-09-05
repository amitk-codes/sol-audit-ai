"use client";

import * as React from "react";

import { loadContract, LENDITY_FI_REPO, type Contract } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export function ContractInput({ onLoaded }: { onLoaded: (contract: Contract) => void }) {
  const [mode, setMode] = React.useState<"github" | "paste">("github");
  const [source, setSource] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function load(input: { source?: string; repo_url?: string }) {
    setLoading(true);
    setError(null);
    try {
      onLoaded(await loadContract(input));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function loadExample() {
    setMode("github");
    setRepoUrl(LENDITY_FI_REPO);
    load({ repo_url: LENDITY_FI_REPO });
  }

  return (
    <Panel className="p-5">
      <div className="mb-4 flex gap-2 text-xs">
        <button onClick={() => setMode("github")} className={tab(mode === "github")}>
          ~/github
        </button>
        <button onClick={() => setMode("paste")} className={tab(mode === "paste")}>
          ~/paste
        </button>
      </div>

      {mode === "github" ? (
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className={field}
        />
      ) : (
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="// paste your Anchor / Rust program here"
          rows={12}
          className={cn(field, "resize-y")}
        />
      )}

      {error && <p className="mt-3 text-sm text-red">! {error}</p>}

      <div className="mt-4 flex items-center gap-4">
        <Button
          disabled={loading}
          onClick={() => load(mode === "github" ? { repo_url: repoUrl } : { source })}
        >
          {loading ? "loading…" : "[▸] load"}
        </Button>
        <button onClick={loadExample} disabled={loading} className="text-xs text-dim hover:text-green">
          › try example (lendity-fi)
        </button>
      </div>
    </Panel>
  );
}

const field =
  "w-full border border-border bg-panel-2 px-3 py-2.5 text-sm text-text outline-none focus:border-green";

function tab(active: boolean) {
  return cn(
    "border px-3 py-1.5",
    active ? "border-green text-green" : "border-border text-dim hover:text-text",
  );
}
