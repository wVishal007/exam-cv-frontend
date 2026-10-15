import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "soft rounded-xl bg-card text-card-foreground transition-shadow",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div
      className={cn("border-b border-line/70 px-6 py-4 dark:border-line-dark/70", className)}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardProps) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3 className={cn("font-serif text-base font-semibold tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }: CardProps) {
  return (
    <p
      className={cn(
        "mt-1 text-sm text-ink-muted dark:text-ink-muted-dark",
        className
      )}
    >
      {children}
    </p>
  );
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-line/70 px-6 py-4 dark:border-line-dark/70",
        className
      )}
    >
      {children}
    </div>
  );
}