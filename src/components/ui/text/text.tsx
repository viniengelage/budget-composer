import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from "react-native";

import { color, fontSize, fontWeight } from "@/styles/tokens";

type Variant =
  | "display"
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption"
  | "overline";

type Tone = "primary" | "secondary" | "inverse" | "brand" | "danger" | "onSidebarMuted";

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
}

/**
 * Único ponto de entrada para texto.
 *
 * O público-alvo tem baixa familiaridade com computador e provável présbita,
 * então o corpo de texto é 17px — um degrau acima do padrão web de 16px.
 * Nenhuma variante desce abaixo de 13px.
 */
export function Text({ variant = "body", tone = "primary", style, ...rest }: TextProps) {
  return <RNText {...rest} style={[styles[variant], toneStyles[tone], style]} />;
}

const styles = StyleSheet.create({
  display: { fontSize: fontSize["3xl"], fontWeight: fontWeight.bold, lineHeight: 46 },
  title: { fontSize: fontSize["2xl"], fontWeight: fontWeight.bold, lineHeight: 38 },
  heading: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, lineHeight: 31 },
  subheading: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: 27 },
  body: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: 24 },
  bodyStrong: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, lineHeight: 24 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 21 },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: 19 },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    lineHeight: 18,
  },
});

const toneStyles = StyleSheet.create({
  primary: { color: color.text.primary },
  secondary: { color: color.text.secondary },
  inverse: { color: color.text.inverse },
  brand: { color: color.text.brand },
  danger: { color: color.text.danger },
  onSidebarMuted: { color: color.text.onSidebarMuted },
});
