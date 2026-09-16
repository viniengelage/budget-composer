import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
} from "react-native";

import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/paths";
import { Text } from "@/components/ui/text/text";
import { color, control, fontSize, radius, space } from "@/styles/tokens";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  icon?: IconName;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const HEIGHTS: Record<Size, number> = {
  sm: control.sm,
  md: control.md,
  lg: control.lg,
};

const FONT_SIZES: Record<Size, number> = {
  sm: fontSize.sm,
  md: fontSize.sm,
  lg: fontSize.md,
};

export function Button({
  label,
  icon,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading;
  const tint = TINTS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        { height: HEIGHTS[size], minHeight: HEIGHTS[size] },
        fullWidth && styles.fullWidth,
        pressed && pressedStyles[variant],
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={FONT_SIZES[size] * 1.25} tint={tint} /> : null}
          <Text style={[styles.label, { color: tint, fontSize: FONT_SIZES[size] }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const TINTS: Record<Variant, string> = {
  primary: color.action.primaryText,
  secondary: color.text.primary,
  danger: color.text.inverse,
  ghost: color.text.brand,
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    paddingHorizontal: space[6],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2] + 2,
  },
  label: { fontWeight: "600" },
  fullWidth: { alignSelf: "stretch" },
  disabled: { opacity: 0.45 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: color.action.primaryBg },
  secondary: {
    backgroundColor: color.bg.surface,
    borderWidth: 1.5,
    borderColor: color.border.strong,
  },
  danger: { backgroundColor: color.action.dangerBg },
  ghost: { backgroundColor: "transparent" },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: color.action.primaryHover },
  secondary: { backgroundColor: color.bg.subtle },
  danger: { opacity: 0.85 },
  ghost: { backgroundColor: color.bg.subtle },
});
