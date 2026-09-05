import { Panel } from "@/components/ui/panel";

export function Loading({ label }: { label: string }) {
  return (
    <Panel className="p-5 text-sm text-dim">
      <span className="text-green">$</span> {label}
      <span className="ml-1 animate-pulse">▍</span>
    </Panel>
  );
}
