"use client";

import * as React from "react";

import { chatStream, type ChatMessage } from "@/lib/api";
import { Markdown } from "@/components/markdown";
import { Panel } from "@/components/ui/panel";

export function ChatView({ source }: { source: string }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function appendToLast(chunk: string) {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      next[next.length - 1] = { ...last, content: last.content + chunk };
      return next;
    });
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const history = messages;
    setMessages([
      ...history,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setLoading(true);
    try {
      await chatStream(source, question, history, appendToLast);
    } catch (err) {
      const message = err instanceof Error ? err.message : "failed";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: `! ${message}` };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel className="flex h-[520px] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <p className="text-faint">
            // ask about the code — e.g. &quot;what happens if collateral drops below the
            threshold?&quot;
          </p>
        )}
        {messages.map((message, index) =>
          message.role === "user" ? (
            <p key={index}>
              <span className="text-green">›</span> <span className="text-text">{message.content}</span>
            </p>
          ) : (
            <div key={index} className="text-dim">
              {message.content ? (
                <Markdown content={message.content} />
              ) : (
                <span>
                  thinking<span className="animate-pulse">▍</span>
                </span>
              )}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
        <span className="text-green">›</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask a question…"
          className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint"
        />
      </form>
    </Panel>
  );
}
