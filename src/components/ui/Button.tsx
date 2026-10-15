import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-paper hover:bg-accent/90 hover:soft-hover active:soft-inset-sm dark:bg-accent-dark dark:text-paper-dark dark:hover:bg-accent-dark/90",
        secondary:
          "bg-card text-ink soft-sm hover:soft-hover active:soft-inset-sm dark:bg-card dark:text-ink-dark",
        outline:
          "border border-line/80 bg-card text-ink soft-sm hover:border-line hover:soft-hover active:soft-inset-sm dark:border-line-dark/80 dark:text-ink-dark",
        ghost:
          "text-ink-muted hover:bg-muted/60 hover:text-ink active:soft-inset-sm dark:text-ink-muted-dark dark:hover:bg-muted/60 dark:hover:text-ink-dark",
        danger:
          "bg-danger text-paper hover:bg-danger/90 hover:soft-hover active:soft-inset-sm dark:bg-danger-dark dark:text-paper-dark dark:hover:bg-danger-dark/90",
        link: "text-accent underline-offset-4 hover:underline dark:text-accent-dark",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2.5",
        lg: "h-11 px-6",
        icon: "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  loading?: boolean;
  asChild?: boolean;
}

export function Button({
  variant,
  size,
  className,
  children,
  loading,
  asChild = false,
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}