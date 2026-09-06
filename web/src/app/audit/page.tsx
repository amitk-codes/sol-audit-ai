"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { type Contract } from "@/lib/api";
import { AuditView } from "@/components/audit-view";
import { ChatView } from "@/components/chat-view";
import { CodeViewer } from "@/components/code-viewer";
import { ContractInput } from "@/components/contract-input";
import { ExplainView } from "@/components/explain-view";
import { FileTree } from "@/components/file-tree";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type Tab = "code" | "explain" | "audit" | "chat";
const TABS: Tab[] = ["code", "explain", "audit", "chat"];

export default function AuditPage() {
  const [contract, setContract] = React.useState<Contract | null>(null);
  const [tab, setTab] = React.useState<Tab>("audit");
  const [activePath, setActivePath] = React.useState<string | null>(null);
  const [showFiles, setShowFiles] = React.useState(false);
  // tabs stay mounted once visited, so switching away and back doesn't re-run the analysis
  const [visited, setVisited] = React.useState<Set<Tab>>(() => new Set<Tab>(["audit"]));

  function onLoaded(loaded: Contract) {
    setContract(loaded);
    setActivePath(loaded.files[0]?.path ?? null);
    setTab("audit");
    setVisited(new Set<Tab>(["audit"]));
  }

  function selectTab(name: Tab) {
    setTab(name);
    setVisited((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));
  }

  if (!contract) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-1 text-lg font-bold">
          <span className="text-green">$</span> audit a program
        </h1>
        <p className="mb-6 text-sm text-dim">
          Load an Anchor / Rust program to explain, audit, and chat over it.
        </p>
        <ContractInput onLoaded={onLoaded} />
      </div>
    );
  }

  const activeFile = contract.files.find((file) => file.path === activePath) ?? null;

  function pickFile(path: string) {
    setActivePath(path);
    setShowFiles(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-6">
      <Panel className="mb-4 flex items-center justify-between p-3 text-sm">
        <span className="text-dim">
          <span className="text-green">$</span> loaded {contract.files.length} file
          {contract.files.length === 1 ? "" : "s"} · {contract.total_chars.toLocaleString()} chars
        </span>
        <button onClick={() => setContract(null)} className="text-xs text-dim hover:text-green">
          ↺ load another
        </button>
      </Panel>

      <button
        onClick={() => setShowFiles((v) => !v)}
        className="mb-3 flex items-center gap-1 text-xs text-dim hover:text-green lg:hidden"
      >
        <ChevronRight className={cn("h-3 w-3 transition-transform", showFiles && "rotate-90")} />
        files ({contract.files.length})
      </button>

      <div className="lg:flex lg:gap-4">
        <aside
          className={cn("mb-4 lg:mb-0 lg:block lg:w-60 lg:shrink-0", showFiles ? "block" : "hidden")}
        >
          <Panel className="max-h-[70vh] overflow-auto p-2">
            <FileTree files={contract.files} activePath={activePath} onSelect={pickFile} />
          </Panel>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex gap-2 text-xs">
            {TABS.map((name) => (
              <button
                key={name}
                onClick={() => selectTab(name)}
                className={cn(
                  "border px-3 py-1.5",
                  tab === name ? "border-green text-green" : "border-border text-dim hover:text-text",
                )}
              >
                {name}
              </button>
            ))}
          </div>

          {visited.has("code") && (
            <div hidden={tab !== "code"}>
              <CodeViewer file={activeFile} />
            </div>
          )}
          {visited.has("explain") && (
            <div hidden={tab !== "explain"}>
              <ExplainView source={contract.combined} />
            </div>
          )}
          {visited.has("audit") && (
            <div hidden={tab !== "audit"}>
              <AuditView source={contract.combined} />
            </div>
          )}
          {visited.has("chat") && (
            <div hidden={tab !== "chat"}>
              <ChatView source={contract.combined} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
