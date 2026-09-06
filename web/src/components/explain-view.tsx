"use client";

import * as React from "react";

import { explainInstructionStream, explainOutline, type ExplainOutline } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Markdown } from "@/components/markdown";
import { Panel } from "@/components/ui/panel";

export function ExplainView({ source }: { source: string }) {
  const [outline, setOutline] = React.useState<ExplainOutline | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setOutline(null);
    explainOutline(source)
      .then((result) => !cancelled && setOutline(result))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (loading) return <Loading label="explaining…" />;
  if (error) return <Panel className="p-5 text-sm text-red">! {error}</Panel>;
  if (!outline) return null;

  return (
    <div className="space-y-4 pb-4">
      {outline.overview && (
        <Panel className="p-5">
          <p className="mb-2 text-xs text-faint">// overview</p>
          <p className="text-sm leading-relaxed">{outline.overview}</p>
        </Panel>
      )}

      <div className="space-y-2">
        {outline.instructions.map((name, index) => (
          <InstructionCard key={`${name}-${index}`} source={source} name={name} />
        ))}
      </div>
    </div>
  );
}

// each instruction streams its own explanation — all cards run in parallel
function InstructionCard({ source, name }: { source: string; name: string }) {
  const [text, setText] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setText("");
    setDone(false);
    explainInstructionStream(source, name, (chunk) => !cancelled && setText((t) => t + chunk))
      .catch(() => {})
      .finally(() => !cancelled && setDone(true));
    return () => {
      cancelled = true;
    };
  }, [source, name]);

  return (
    <Panel className="p-4">
      <p className="text-sm font-bold text-green">fn {name}</p>
      <div className="mt-1 text-sm text-dim">
        {text ? <Markdown content={text} /> : <span className="text-faint">…</span>}
        {!done && text && <span className="animate-pulse">▍</span>}
      </div>
    </Panel>
  );
}
