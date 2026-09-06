import Link from "next/link";

import { Logo } from "@/components/logo";
import { SocialLinks } from "@/components/social-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg/90 px-5 py-3 backdrop-blur">
      <Link href="/">
        <Logo />
      </Link>
      <SocialLinks />
    </header>
  );
}
