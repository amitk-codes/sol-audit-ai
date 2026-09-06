import * as React from "react";

import { type LoadedFile } from "@/lib/api";
import { Panel } from "@/components/ui/panel";

const KEYWORDS = new Set([
  "fn", "pub", "let", "mut", "struct", "enum", "impl", "use", "mod", "match", "if", "else",
  "for", "while", "loop", "return", "self", "Self", "crate", "as", "ref", "move", "async",
  "await", "dyn", "trait", "const", "static", "type", "where", "unsafe", "in", "super", "true", "false",
]);

// A small regex tokenizer — enough to give Rust a readable, on-theme highlight.
const TOKEN = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)?'|#\[[^\]]*\]|\b\d[\d_]*\b|[A-Za-z_][A-Za-z0-9_]*!?|\s+|[^\sA-Za-z0-9_])/g;

function highlight(line: string, keyBase: string): React.ReactNode[] {
  const commentAt = line.indexOf("//");
  const code = commentAt >= 0 ? line.slice(0, commentAt) : line;
  const comment = commentAt >= 0 ? line.slice(commentAt) : "";

  const nodes: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = TOKEN.exec(code)) !== null) {
    const token = match[0];
    let cls = "";
    if (/^["']/.test(token)) cls = "text-amber";
    else if (token.startsWith("#[")) cls = "text-blue";
    else if (/^\d/.test(token)) cls = "text-blue";
    else if (token.endsWith("!")) cls = "text-green";
    else if (KEYWORDS.has(token)) cls = "text-green";
    else if (/^[A-Z]/.test(token)) cls = "text-blue";
    nodes.push(
      cls ? (
        <span key={`${keyBase}-${i}`} className={cls}>
          {token}
        </span>
      ) : (
        token
      ),
    );
    i++;
  }
  if (comment) {
    nodes.push(
      <span key={`${keyBase}-c`} className="text-faint">
        {comment}
      </span>,
    );
  }
  return nodes;
}

export function CodeViewer({ file }: { file: LoadedFile | null }) {
  if (!file) {
    return <Panel className="p-5 text-sm text-faint">// select a file</Panel>;
  }

  const lines = file.content.split("\n");

  return (
    <Panel className="flex h-full max-h-[70vh] flex-col overflow-hidden lg:max-h-none">
      <div className="shrink-0 border-b border-border px-4 py-2 text-xs text-dim">{file.path}</div>
      <div className="min-h-0 flex-1 overflow-auto">
        <pre className="py-2 text-xs leading-relaxed text-dim">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex px-3">
                <span className="w-10 shrink-0 select-none pr-4 text-right text-faint">
                  {index + 1}
                </span>
                <span className="whitespace-pre">{line ? highlight(line, `l${index}`) : " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </Panel>
  );
}
