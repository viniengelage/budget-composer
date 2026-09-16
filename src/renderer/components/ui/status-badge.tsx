import { Icon, type IconName } from "@/components/ui/icon";
import type { QuoteStatus } from "@shared/types";

const CONFIG: Record<
  QuoteStatus,
  { label: string; icon: IconName; className: string }
> = {
  pending: {
    label: "Aguardando",
    icon: "clock-countdown",
    className: "bg-warning-50 text-warning-600",
  },
  approved: {
    label: "Aprovado",
    icon: "check-circle",
    className: "bg-brand-50 text-brand-800",
  },
  expired: {
    label: "Vencido",
    icon: "clock-countdown",
    className: "bg-danger-50 text-danger-600",
  },
  rejected: {
    label: "Recusado",
    icon: "trash",
    className: "bg-danger-50 text-danger-600",
  },
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-3.5 text-xs font-semibold ${config.className}`}
    >
      <Icon name={config.icon} size={17} />
      <span className="sr-only">Situação: </span>
      {config.label}
    </span>
  );
}

export function statusLabel(status: QuoteStatus): string {
  return CONFIG[status].label;
}
