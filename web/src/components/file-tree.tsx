import { type LoadedFile } from "@/lib/api";
import { cn } from "@/lib/utils";

export function FileTree({
  files,
  activePath,
  onSelect,
}: {
  files: LoadedFile[];
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      <p className="px-2 pb-2 text-[11px] uppercase tracking-wider text-faint">
        // files ({files.length})
      </p>
      {files.map((file) => {
        const name = file.path.split("/").pop() ?? file.path;
        const dir = file.path.slice(0, file.path.length - name.length).replace(/\/$/, "");
        const active = file.path === activePath;
        return (
          <button
            key={file.path}
            title={file.path}
            onClick={() => onSelect(file.path)}
            className={cn(
              "flex w-full items-start gap-1.5 px-2 py-1 text-left",
              active ? "bg-panel-2 text-green" : "text-dim hover:text-text",
            )}
          >
            <span className="text-faint">›</span>
            <span className="min-w-0">
              <span className="block truncate text-xs">{name}</span>
              {dir && <span className="block truncate text-[10px] text-faint">{dir}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
