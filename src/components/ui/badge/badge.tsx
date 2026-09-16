import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/paths";
import { Text } from "@/components/ui/text/text";
import { color, radius, space } from "@/styles/tokens";
import type { QuoteStatus } from "@/types";

/**
 * Status nunca é comunicado só por cor — sempre cor + ícone + palavra.
 * Daltonismo afeta ~8% dos homens, e o rótulo escrito também ajuda quem
 * simplesmente não memorizou o código de cores.
 */
const STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; icon: IconName; bg: string; fg: string }
> = {
  pending: {
    label: "Aguardando",
    icon: "clock-countdown",
    bg: color.status.pending.bg,
    fg: color.status.pending.text,
  },
  approved: {
    label: "Aprovado",
    icon: "check-circle",
    bg: color.status.approved.bg,
    fg: color.status.approved.text,
  },
  expired: {
    label: "Vencido",
    icon: "clock-countdown",
    bg: color.status.expired.bg,
    fg: color.status.expired.text,
  },
  rejected: {
    label: "Recusado",
    icon: "trash",
    bg: color.status.expired.bg,
    fg: color.status.expired.text,
  },
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Situação: ${config.label}`}
      style={[styles.badge, { backgroundColor: config.bg }]}
    >
      <Icon name={config.icon} size={17} tint={config.fg} />
      <Text variant="caption" style={[styles.label, { color: config.fg }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: space[1] + 2,
    paddingLeft: space[3],
    paddingRight: space[3] + 2,
    paddingVertical: space[1] + 2,
    borderRadius: radius.pill,
  },
  label: { fontWeight: "600" },
});
