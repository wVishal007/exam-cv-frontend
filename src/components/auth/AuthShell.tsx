import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center">
        <Link
          to="/"
          className="font-serif text-2xl font-semibold tracking-tight"
        >
          exam-cv
        </Link>
        <h1 className="mt-4 font-serif text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-ink-muted dark:text-ink-muted-dark">{subtitle}</p>
      </div>

      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}