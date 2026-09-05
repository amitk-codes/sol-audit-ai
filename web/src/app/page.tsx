import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
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

        <ul className="mt-5 space-y-1.5 text-sm text-dim">
          <li>
            <span className="text-green">›</span> explain — what each instruction does
          </li>
          <li>
            <span className="text-green">›</span> audit — severity-ranked findings from a Solana checklist
          </li>
          <li>
            <span className="text-green">›</span> chat — ask questions about the code
          </li>
        </ul>

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

        <p className="mt-6 text-xs text-faint">// not a certified audit — a first-pass review</p>
      </Panel>
    </div>
  );
}
