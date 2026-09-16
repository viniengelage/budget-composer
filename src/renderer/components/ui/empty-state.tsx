import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/utils/cn";

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  tone?: "brand" | "neutral";
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  tone = "brand",
  children,
}: EmptyStateProps) {
  const isBrand = tone === "brand";

  return (
    <div className="flex flex-col items-center justify-center gap-3.5 p-8 text-center">
      <div
        className={cn(
          "mb-1 flex h-24 w-24 items-center justify-center rounded-full",
          isBrand ? "bg-brand-soft text-content-brand" : "bg-subtle text-content-muted",
        )}
      >
        <Icon name={icon} size={44} />
      </div>

      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-[520px] text-content-muted">{description}</p>

      {children}
    </div>
  );
}
