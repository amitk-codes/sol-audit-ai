"use client";

import * as React from "react";

import { explainStream, type Instruction } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Panel } from "@/components/ui/panel";

export function ExplainView({ source }: { source: string }) {
  const [overview, setOverview] = React.useState("");
  const [instructions, setInstructions] = React.useState<Instruction[]>([]);
  const [streaming, setStreaming] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setOverview("");
    setInstructions([]);
    setStreaming(true);
    setError(null);

    explainStream(source, (obj) => {
      if (cancelled) return;
      if (typeof obj.error === "string") setError(obj.error);
      else if (typeof obj.overview === "string") setOverview(obj.overview);
      else if (typeof obj.name === "string") {
        setInstructions((prev) => [...prev, { name: obj.name as string, summary: String(obj.summary ?? "") }]);
      }
    })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => !cancelled && setStreaming(false));

    return () => {
      cancelled = true;
    };
  }, [source]);

  const empty = !overview && instructions.length === 0;
  if (streaming && empty) return <Loading label="explaining…" />;
  if (error && empty) return <Panel className="p-5 text-sm text-red">! {error}</Panel>;

  return (
    <div className="space-y-4">
      {overview && (
        <Panel className="p-5">
          <p className="mb-2 text-xs text-faint">// overview</p>
          <p className="text-sm leading-relaxed">{overview}</p>
        </Panel>
      )}

      <div className="space-y-2">
        {instructions.map((instruction, index) => (
          <Panel key={index} className="p-4">
            <p className="text-sm font-bold text-green">fn {instruction.name}</p>
            <p className="mt-1 text-sm text-dim">{instruction.summary}</p>
          </Panel>
        ))}
      </div>

      {streaming && !empty && (
        <p className="text-xs text-faint">
          streaming<span className="animate-pulse">▍</span>
        </p>
      )}
      {error && !empty && <p className="text-xs text-red">! {error}</p>}
    </div>
  );
}
