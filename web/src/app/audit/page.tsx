"use client";

import * as React from "react";

import { type Contract } from "@/lib/api";
import { ContractInput } from "@/components/contract-input";
import { Panel } from "@/components/ui/panel";

export default function AuditPage() {
  const [contract, setContract] = React.useState<Contract | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="mb-1 text-lg font-bold">
        <span className="text-green">$</span> audit a program
      </h1>
      <p className="mb-6 text-sm text-dim">
        Load an Anchor / Rust program to explain, audit, and chat over it.
      </p>

      {!contract ? (
        <ContractInput onLoaded={setContract} />
      ) : (
        <div className="space-y-4">
          <Panel className="flex items-center justify-between p-4 text-sm">
            <span className="text-dim">
              loaded <span className="text-green">{contract.files.length}</span> file
              {contract.files.length === 1 ? "" : "s"} ·{" "}
              {contract.total_chars.toLocaleString()} chars
            </span>
            <button onClick={() => setContract(null)} className="text-xs text-dim hover:text-green">
              ↺ load another
            </button>
          </Panel>

          <Panel className="p-5 text-sm text-faint">// explain · audit · chat — coming next</Panel>
        </div>
      )}
    </div>
  );
}
