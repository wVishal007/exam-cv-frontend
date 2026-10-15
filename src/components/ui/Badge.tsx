import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-accent-soft text-accent dark:bg-accent-soft-dark dark:text-accent-dark",
        outline: "border border-line/80 text-ink-muted dark:border-line-dark/80 dark:text-ink-muted-dark",
        danger:
          "bg-danger-soft text-danger dark:bg-danger-soft-dark dark:text-danger-dark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}