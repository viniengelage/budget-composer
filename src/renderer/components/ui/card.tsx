import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface CardProps {
  title?: string;
  step?: number;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, step, headerAction, children, className }: CardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 shadow-card",
        className,
      )}
    >
      {title ? (
        <header className="flex items-center gap-2.5">
          {step !== undefined ? (
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
            >
              {step}
            </span>
          ) : null}
          <h2 className="flex-1 text-lg font-semibold">{title}</h2>
          {headerAction}
        </header>
      ) : null}
      {children}
    </section>
  );
}
