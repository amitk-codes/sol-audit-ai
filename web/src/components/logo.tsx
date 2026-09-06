export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 items-center gap-0.5 border border-green px-2 font-bold text-green">
        <span className="text-sm">&gt;</span>
        <span className="animate-pulse text-sm">_</span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-text">sol-audit-ai</span>
        <span className="block text-[10px] text-faint">by Amit Kumar</span>
      </span>
    </span>
  );
}
