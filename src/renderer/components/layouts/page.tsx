import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function Page({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  leading?: ReactNode;
}

export function PageHeader({ title, subtitle, action, leading }: PageHeaderProps) {
  return (
    <header className="flex items-start gap-4 border-b border-line bg-surface px-10 py-6">
      {leading}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="mt-1 text-content-muted">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("scroll-area min-h-0 flex-1 px-10 py-8", className)}>
      {children}
    </div>
  );
}
