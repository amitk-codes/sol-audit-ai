import { type LoadedFile } from "@/lib/api";
import { Panel } from "@/components/ui/panel";

export function CodeViewer({ file }: { file: LoadedFile | null }) {
  if (!file) {
    return <Panel className="p-5 text-sm text-faint">// select a file</Panel>;
  }

  const lines = file.content.split("\n");

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border px-4 py-2 text-xs text-dim">{file.path}</div>
      <div className="max-h-[600px] overflow-auto">
        <pre className="py-2 text-xs leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex px-3">
                <span className="w-10 shrink-0 select-none pr-4 text-right text-faint">
                  {index + 1}
                </span>
                <span className="whitespace-pre text-text">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </Panel>
  );
}
