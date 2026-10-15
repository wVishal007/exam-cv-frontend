import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "soft-inset flex h-10 w-full rounded-xl border border-transparent bg-card px-3 py-2 text-sm transition-shadow placeholder:text-ink-muted focus:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-ink-muted-dark",
        className
      )}
      {...props}
    />
  );
}