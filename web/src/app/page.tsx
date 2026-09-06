import Link from "next/link";
import { Cpu, FileCode2, MessageSquare, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const STEPS = [
  {
    icon: FileCode2,
    cmd: "load",
    desc: "Paste Rust source or drop a GitHub repo URL — every .rs file is pulled in.",
  },
  {
    icon: ShieldCheck,
    cmd: "audit",
    desc: "The whole program is checked against a Solana-specific vulnerability checklist, ranked by severity.",
  },
  {
    icon: MessageSquare,
    cmd: "chat",
    desc: "Ask questions about the code — answers stream back, grounded in the source.",
  },
];

const CHECKLIST = [
  "Missing signer checks",
  "Missing owner / account validation",
  "Missing has_one / address constraints",
  "Arbitrary or unchecked CPI",
  "Integer overflow / underflow",
  "Unsafe PDA seeds / bump",
  "init_if_needed misuse",
  "Account closing / revival",
  "Duplicate mutable accounts",
  "Unvalidated oracle data (Pyth)",
  "Access-control gaps",
  "Rounding / precision loss",
];

const STACK = [
  {
    icon: Cpu,
    title: "Model routing + retry",
    desc: "Gemini with a pinned model and SDK backoff — no flaky -latest endpoints.",
  },
  {
    icon: Sparkles,
    title: "Whole-context audit",
    desc: "The entire program is sent at once so cross-function bugs aren't missed.",
  },
  {
    icon: Zap,
    title: "RAG chat + streaming",
    desc: "Large repos are chunked and retrieved; answers stream token by token.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-5 py-16">
      <Panel className="p-6">
        <div className="flex gap-1.5 pb-4">
          <span className="h-3 w-3 rounded-full bg-red" />
          <span className="h-3 w-3 rounded-full bg-amber" />
          <span className="h-3 w-3 rounded-full bg-green" />
        </div>

        <p className="text-sm text-dim">
          <span className="text-green">$</span> sol-audit-ai --help
        </p>
        <h1 className="mt-4 text-2xl font-bold">AI-assisted security review for Solana programs</h1>
        <p className="mt-3 leading-relaxed text-dim">
          Paste a program&apos;s Rust source or point it at a GitHub repo. Get a plain-English
          explanation, a severity-ranked vulnerability report, and a chat over the code.
        </p>

        <div className="mt-7 flex gap-3">
          <Link href="/audit" className={buttonVariants()}>
            [▸] run audit
          </Link>
          <a
            href="https://github.com/amitk-codes/sol-audit-ai"
            className={buttonVariants({ variant: "outline" })}
          >
            view source
          </a>
        </div>

      </Panel>

      <section>
        <p className="mb-4 text-xs uppercase tracking-wider text-faint">// how it works</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Panel key={step.cmd} className="p-5">
              <step.icon className="mb-3 h-5 w-5 text-green" />
              <p className="text-sm font-bold">
                <span className="text-green">$</span> {step.cmd}
              </p>
              <p className="mt-1.5 text-sm text-dim">{step.desc}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-1 text-xs uppercase tracking-wider text-faint">// vulnerability checklist</p>
        <p className="mb-4 text-sm text-dim">
          Every audit is grounded in Solana / Anchor-specific checks — not a generic LLM guess.
        </p>
        <Panel className="p-5">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm text-dim">
                <span className="text-green">›</span> {item}
              </p>
            ))}
          </div>
        </Panel>
      </section>

      <section>
        <p className="mb-4 text-xs uppercase tracking-wider text-faint">// under the hood</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {STACK.map((item) => (
            <Panel key={item.title} className="p-5">
              <item.icon className="mb-3 h-5 w-5 text-green" />
              <p className="text-sm font-bold">{item.title}</p>
              <p className="mt-1.5 text-sm text-dim">{item.desc}</p>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
