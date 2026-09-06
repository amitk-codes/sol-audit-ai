"use client";

import * as React from "react";
import { ChevronRight, FileCode, Folder } from "lucide-react";

import { type LoadedFile } from "@/lib/api";
import { cn } from "@/lib/utils";

type TreeNode = {
  name: string;
  path: string;
  isFile: boolean;
  children: Map<string, TreeNode>;
};

function buildTree(files: LoadedFile[]): TreeNode {
  const root: TreeNode = { name: "", path: "", isFile: false, children: new Map() };
  for (const file of files) {
    const parts = file.path.split("/");
    let node = root;
    parts.forEach((part, index) => {
      if (!node.children.has(part)) {
        node.children.set(part, {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          isFile: index === parts.length - 1,
          children: new Map(),
        });
      }
      node = node.children.get(part)!;
    });
  }
  return root;
}

function sortedChildren(node: TreeNode): TreeNode[] {
  return [...node.children.values()].sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}

function Node({
  node,
  depth,
  activePath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const pad = { paddingLeft: depth * 12 + 8 };

  if (node.isFile) {
    return (
      <button
        title={node.path}
        onClick={() => onSelect(node.path)}
        style={pad}
        className={cn(
          "flex w-full items-center gap-1.5 py-1 pr-2 text-left text-xs",
          node.path === activePath ? "bg-panel-2 text-green" : "text-dim hover:text-text",
        )}
      >
        <FileCode className="h-4 w-4 shrink-0 text-faint" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={pad}
        className="flex w-full items-center gap-1 py-1 pr-2 text-left text-xs text-dim hover:text-text"
      >
        <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-90")} />
        <Folder className="h-4 w-4 shrink-0 text-faint" />
        <span className="truncate">{node.name}</span>
      </button>
      {open && sortedChildren(node).map((child) => (
        <Node key={child.path} node={child} depth={depth + 1} activePath={activePath} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function FileTree({
  files,
  activePath,
  onSelect,
}: {
  files: LoadedFile[];
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  const tree = React.useMemo(() => buildTree(files), [files]);

  return (
    <div className="space-y-0.5">
      <p className="px-2 pb-2 text-[11px] uppercase tracking-wider text-faint">
        // files ({files.length})
      </p>
      {sortedChildren(tree).map((child) => (
        <Node key={child.path} node={child} depth={0} activePath={activePath} onSelect={onSelect} />
      ))}
    </div>
  );
}
