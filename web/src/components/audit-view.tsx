"use client";

import * as React from "react";
import { AlertTriangle, Download, Info, ShieldAlert } from "lucide-react";

import { auditContract, type AuditReport, type Finding } from "@/lib/api";
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

function exportReport(report: AuditReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "audit-report.json";
  link.click();
  URL.revokeObjectURL(url);
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
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-faint">// summary</p>
          <button
            onClick={() => exportReport(data)}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-green"
          >
            <Download className="h-3.5 w-3.5" /> export json
          </button>
        </div>
        <p className="text-sm leading-relaxed">{data.summary}</p>

        {findings.length > 0 && (
          <>
            <div className="mt-4 flex h-1.5 overflow-hidden">
              {SEVERITY_ORDER.map((severity) => {
                const count = findings.filter((f) => f.severity === severity).length;
                if (!count) return null;
                return (
                  <div key={severity} style={{ flex: count }} className={severityBar(severity)} />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {SEVERITY_ORDER.map((severity) => {
                const count = findings.filter((f) => f.severity === severity).length;
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
