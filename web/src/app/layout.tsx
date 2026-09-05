import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "sol-audit-ai",
  description: "AI-assisted security review for Solana / Anchor programs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-bg text-text">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
