import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import { color, space } from "@/styles/tokens";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  leading?: ReactNode;
}

export function PageHeader({ title, subtitle, action, leading }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {leading}
        <View style={styles.titleBlock}>
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="label" tone="secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {action}
    </View>
  );
}

export function Page({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.page}>
      {header}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: color.bg.canvas,
    padding: space[8],
    paddingHorizontal: space[10],
    gap: space[6],
  },
  body: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space[4],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3] + 2,
    flex: 1,
  },
  titleBlock: { gap: space[1] },
});
