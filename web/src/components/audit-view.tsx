"use client";

import * as React from "react";
import { AlertTriangle, Download, Info, ShieldAlert } from "lucide-react";

import { auditStream, type Finding } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Markdown } from "@/components/markdown";
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

function severityBar(severity: string) {
  switch (severity) {
    case "critical":
    case "high":
      return "bg-red";
    case "medium":
      return "bg-amber";
    case "low":
      return "bg-blue";
    default:
      return "bg-faint";
  }
}

function SeverityIcon({ severity, className }: { severity: string; className?: string }) {
  if (severity === "critical" || severity === "high") return <ShieldAlert className={className} />;
  if (severity === "medium") return <AlertTriangle className={className} />;
  return <Info className={className} />;
}

function exportReport(summary: string, findings: Finding[]) {
  const blob = new Blob([JSON.stringify({ summary, findings }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "audit-report.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function AuditView({ source }: { source: string }) {
  const [summary, setSummary] = React.useState("");
  const [findings, setFindings] = React.useState<Finding[]>([]);
  const [streaming, setStreaming] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setSummary("");
    setFindings([]);
    setStreaming(true);
    setError(null);

    auditStream(source, (obj) => {
      if (cancelled) return;
      if (typeof obj.error === "string") setError(obj.error);
      else if (typeof obj.summary === "string") setSummary(obj.summary);
      else if (typeof obj.title === "string") setFindings((prev) => [...prev, obj as Finding]);
    })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => !cancelled && setStreaming(false));

    return () => {
      cancelled = true;
    };
  }, [source]);

  const empty = !summary && findings.length === 0;
  if (streaming && empty) return <Loading label="auditing…" />;
  if (error && empty) return <Panel className="p-5 text-sm text-red">! {error}</Panel>;

  const sorted = [...findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-faint">// summary</p>
          {!streaming && findings.length > 0 && (
            <button
              onClick={() => exportReport(summary, sorted)}
              className="flex items-center gap-1.5 text-xs text-dim hover:text-green"
            >
              <Download className="h-3.5 w-3.5" /> export json
            </button>
          )}
        </div>
        {summary ? (
          <p className="text-sm leading-relaxed">{summary}</p>
        ) : (
          <p className="text-sm text-faint">
            analysing<span className="animate-pulse">▍</span>
          </p>
        )}

        {sorted.length > 0 && (
          <>
            <div className="mt-4 flex h-1.5 overflow-hidden">
              {SEVERITY_ORDER.map((severity) => {
                const count = sorted.filter((f) => f.severity === severity).length;
                if (!count) return null;
                return (
                  <div key={severity} style={{ flex: count }} className={severityBar(severity)} />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {SEVERITY_ORDER.map((severity) => {
                const count = sorted.filter((f) => f.severity === severity).length;
                if (!count) return null;
                return (
                  <span
                    key={severity}
                    className={cn("flex items-center gap-1 border px-2 py-1", severityColor(severity))}
                  >
                    <SeverityIcon severity={severity} className="h-3 w-3" />
                    {severity}: {count}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </Panel>

      {sorted.map((finding, index) => (
        <FindingCard key={index} finding={finding} />
      ))}

      {!streaming && findings.length === 0 && (
        <Panel className="p-5 text-sm text-green">✓ no findings from the checklist</Panel>
      )}
      {streaming && !empty && (
        <p className="text-xs text-faint">
          streaming<span className="animate-pulse">▍</span>
        </p>
      )}
      {error && !empty && <p className="text-xs text-red">! {error}</p>}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold">
          <SeverityIcon
            severity={finding.severity}
            className={cn("h-4 w-4", severityColor(finding.severity).split(" ")[0])}
          />
          {finding.title}
        </p>
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
      <div className="mt-2 text-sm text-dim">
        <Markdown content={finding.description} />
      </div>
      {finding.recommendation && (
        <div className="mt-2 text-sm">
          <span className="text-green">→ fix:</span>
          <div className="mt-1 text-dim">
            <Markdown content={finding.recommendation} />
          </div>
        </div>
      )}
    </Panel>
  );
}
