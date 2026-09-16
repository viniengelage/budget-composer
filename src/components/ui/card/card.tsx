import { type ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { Text } from "@/components/ui/text/text";
import { color, radius, space } from "@/styles/tokens";

export interface CardProps extends ViewProps {
  title?: string;
  step?: number;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function Card({ title, step, headerAction, children, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {title ? (
        <View style={styles.header}>
          {step !== undefined ? (
            <View style={styles.step}>
              <Text variant="label" tone="inverse" style={styles.stepLabel}>
                {step}
              </Text>
            </View>
          ) : null}
          <Text variant="subheading" style={styles.title}>
            {title}
          </Text>
          {headerAction}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border.default,
    padding: space[5],
    gap: space[4],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3] - 2,
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: color.action.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontWeight: "700" },
  title: { flex: 1 },
});
