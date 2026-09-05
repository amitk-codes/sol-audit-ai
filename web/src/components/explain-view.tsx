"use client";

import * as React from "react";

import { explainContract, type Explanation } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Panel } from "@/components/ui/panel";

export function ExplainView({ source }: { source: string }) {
  const [data, setData] = React.useState<Explanation | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    explainContract(source)
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (loading) return <Loading label="explaining…" />;
  if (error) return <Panel className="p-5 text-sm text-red">! {error}</Panel>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <p className="mb-2 text-xs text-faint">// overview</p>
        <p className="text-sm leading-relaxed">{data.overview}</p>
      </Panel>

      <div className="space-y-2">
        {data.instructions.map((instruction, index) => (
          <Panel key={index} className="p-4">
            <p className="text-sm font-bold text-green">fn {instruction.name}</p>
            <p className="mt-1 text-sm text-dim">{instruction.summary}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
