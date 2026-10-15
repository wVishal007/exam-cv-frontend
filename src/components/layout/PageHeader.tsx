import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-serif text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-ink-muted dark:text-ink-muted-dark">{description}</p>
      )}
      {children}
    </div>
  );
}