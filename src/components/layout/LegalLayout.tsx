import type { ReactNode } from "react";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20"
      >
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink dark:text-ink-dark">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}