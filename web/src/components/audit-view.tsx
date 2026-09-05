"use client";

import * as React from "react";

import { auditContract, type AuditReport, type Finding } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];

function severityColor(severity: string) {
  switch (severity) {
    case "critical":
    case "high":
      return "text-red border-red/40";
    case "medium":
      return "text-amber border-amber/40";
    case "low":
      return "text-blue border-blue/40";
    default:
      return "text-dim border-border";
  }
}

export function AuditView({ source }: { source: string }) {
  const [data, setData] = React.useState<AuditReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    auditContract(source)
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (loading) return <Loading label="auditing…" />;
  if (error) return <Panel className="p-5 text-sm text-red">! {error}</Panel>;
  if (!data) return null;

  const findings = [...data.findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <p className="mb-2 text-xs text-faint">// summary</p>
        <p className="text-sm leading-relaxed">{data.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {SEVERITY_ORDER.map((severity) => {
            const count = findings.filter((finding) => finding.severity === severity).length;
            if (!count) return null;
            return (
              <span key={severity} className={cn("border px-2 py-1", severityColor(severity))}>
                {severity}: {count}
              </span>
            );
          })}
        </div>
      </Panel>

      {findings.length === 0 ? (
        <Panel className="p-5 text-sm text-green">✓ no findings from the checklist</Panel>
      ) : (
        findings.map((finding, index) => <FindingCard key={index} finding={finding} />)
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold">{finding.title}</p>
        <span
          className={cn(
            "shrink-0 border px-2 py-0.5 text-xs font-bold uppercase",
            severityColor(finding.severity),
          )}
        >
          {finding.severity}
        </span>
      </div>
      <p className="mt-1 text-xs text-faint">
        {finding.category}
        {finding.location ? ` · ${finding.location}` : ""}
      </p>
      <p className="mt-2 text-sm text-dim">{finding.description}</p>
      {finding.recommendation && (
        <p className="mt-2 text-sm">
          <span className="text-green">→ fix:</span>{" "}
          <span className="text-dim">{finding.recommendation}</span>
        </p>
      )}
    </Panel>
  );
}
