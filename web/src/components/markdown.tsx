import * as React from "react";

import { cn } from "@/lib/utils";

// A small, dependency-free markdown renderer. XSS-safe: it builds React nodes and never
// uses dangerouslySetInnerHTML. Handles headings, bullet / numbered lists, fenced code
// blocks, inline code and bold — enough for the model's output.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${index}`} className="font-bold text-text">
          {match[1]}
        </strong>,
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <code key={`${keyPrefix}-c${index}`} className="bg-panel-2 px-1 text-green">
          {match[2]}
        </code>,
      );
    }
    last = match.index + match[0].length;
    index++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto border border-border bg-panel-2 p-3 text-xs text-green"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^#{1,3}\s+(.*)$/);
    if (heading) {
      blocks.push(
        <p key={key++} className="font-bold text-text">
          {renderInline(heading[1], `h${key}`)}
        </p>,
      );
      i++;
      continue;
    }

    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ""));
      }
      blocks.push(
        <ul key={key++} className="space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-green">›</span>
              <span>{renderInline(item, `li${key}-${idx}`)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !/^#{1,3}\s+/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i++]);
    }
    blocks.push(
      <p key={key++} className="leading-relaxed">
        {renderInline(paragraph.join(" "), `p${key}`)}
      </p>,
    );
  }

  return <div className={cn("space-y-2", className)}>{blocks}</div>;
}
