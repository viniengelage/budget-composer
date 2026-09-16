/**
 * Design tokens — espelho fiel dos token sets do Penpot
 * (`orcamentos-core` e `orcamentos-semantic`).
 *
 * REGRA: nenhum componente declara cor, espaçamento ou raio literal.
 * Sempre consumir daqui. Se falta um valor, adicione um token — não um literal.
 */

/* ---------- Tier 1: primitivas (orcamentos-core) ---------- */

export const palette = {
  brand50: "#E9F5EC",
  brand100: "#CDE9D6",
  brand300: "#7CC495",
  brand500: "#1F9D55",
  brand700: "#15803D",
  brand800: "#14532D",

  ink900: "#0C1512",
  ink800: "#16211C",
  ink700: "#243029",

  neutral600: "#566B5E",
  neutral400: "#8A9A90",
  neutral200: "#DCE3DD",
  neutral100: "#EDF1EE",
  neutral50: "#F5F7F5",
  white: "#FFFFFF",

  danger600: "#C62828",
  danger50: "#FCECEC",
  warning600: "#B45309",
  warning50: "#FDF3E3",
} as const;

/** Escala de 4px. Todo espaçamento sai daqui. */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  xs: 13,
  sm: 15,
  md: 17,
  lg: 20,
  xl: 24,
  "2xl": 30,
  "3xl": 38,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/**
 * Altura mínima de alvo clicável. 44px é o piso das WCAG/HIG.
 * `lg` é o padrão das ações primárias desta app — o público-alvo tem
 * baixa familiaridade com computador, então alvos generosos são requisito.
 */
export const control = {
  sm: 40,
  md: 48,
  lg: 56,
} as const;

/* ---------- Tier 2: semânticas (orcamentos-semantic) ---------- */

export const color = {
  bg: {
    canvas: palette.neutral50,
    surface: palette.white,
    subtle: palette.neutral100,
    sidebar: palette.ink900,
    sidebarActive: palette.brand700,
    brandSoft: palette.brand50,
  },
  text: {
    primary: palette.ink900,
    secondary: palette.neutral600,
    inverse: palette.white,
    brand: palette.brand700,
    danger: palette.danger600,
    onSidebar: palette.white,
    onSidebarMuted: palette.neutral400,
  },
  border: {
    default: palette.neutral200,
    strong: palette.neutral400,
    focus: palette.brand700,
  },
  action: {
    primaryBg: palette.brand700,
    primaryText: palette.white,
    primaryHover: palette.brand800,
    dangerBg: palette.danger600,
  },
  status: {
    approved: { bg: palette.brand50, text: palette.brand800 },
    pending: { bg: palette.warning50, text: palette.warning600 },
    expired: { bg: palette.danger50, text: palette.danger600 },
  },
  /** Scrim do modal. Único valor com alfa — tokens de cor do Penpot não carregam opacidade. */
  overlay: "rgba(12, 21, 18, 0.62)",
} as const;

export const layout = {
  sidebarWidth: 260,
  contentPadding: space[10],
  minWindowWidth: 1180,
  minWindowHeight: 760,
} as const;

export type Space = keyof typeof space;
export type Radius = keyof typeof radius;
export type FontSize = keyof typeof fontSize;
