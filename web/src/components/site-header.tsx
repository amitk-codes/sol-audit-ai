import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center gap-4 border-b border-border px-5 py-3">
      <Link href="/" className="flex items-center gap-2.5 text-sm font-bold">
        <span className="grid h-8 w-8 place-items-center border border-green text-green">✦</span>
        <span>
          <b className="text-green">sol</b>_audit_ai
        </span>
      </Link>
      <span className="ml-auto text-xs text-faint">// AI-assisted first-pass review</span>
    </header>
  );
}
