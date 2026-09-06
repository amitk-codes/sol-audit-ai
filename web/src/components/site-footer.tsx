import { SocialLinks } from "@/components/social-links";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border px-5 py-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-faint">
          <span className="text-green">$</span> built with <span className="text-red">♥</span> by
          Amit Kumar
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
