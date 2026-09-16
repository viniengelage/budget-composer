import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/paths";
import { Text } from "@/components/ui/text/text";
import { color, radius, space } from "@/styles/tokens";

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  /** Explique o valor da ação, não só a ausência de dados. */
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
    <View style={styles.wrapper}>
      <View
        style={[
          styles.badge,
          { backgroundColor: isBrand ? color.bg.brandSoft : color.bg.subtle },
        ]}
      >
        <Icon
          name={icon}
          size={44}
          tint={isBrand ? color.text.brand : color.text.secondary}
        />
      </View>

      <Text variant="heading" style={styles.centered}>
        {title}
      </Text>
      <Text variant="body" tone="secondary" style={[styles.centered, styles.description]}>
        {description}
      </Text>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: space[3] + 2,
    padding: space[8],
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space[1],
  },
  centered: { textAlign: "center" },
  description: { maxWidth: 520 },
});
