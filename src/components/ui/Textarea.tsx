import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(
        "soft-inset flex min-h-[120px] w-full resize-y rounded-xl border border-transparent bg-card px-3 py-2 text-sm leading-relaxed transition-shadow placeholder:text-ink-muted focus:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-ink-muted-dark",
        className
      )}
      {...props}
    />
  );
}