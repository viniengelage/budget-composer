import type { IconName } from "@/components/ui";

/**
 * Registro de rotas.
 *
 * Não usamos expo-router nem react-navigation: este é um app de janela única
 * com navegação lateral persistente, sem histórico de pilha, sem deep link e
 * sem gesto de voltar. Uma máquina de estados tipada resolve o problema sem
 * arrastar dependências nativas que ainda não têm suporte garantido em
 * react-native-windows e react-native-macos.
 */
export const ROUTES = {
  quotes: "quotes",
  quoteCreate: "quoteCreate",
  products: "products",
  customers: "customers",
  settings: "settings",
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavigationEntry {
  route: RouteName;
  label: string;
  icon: IconName;
}

/** Itens visíveis na barra lateral, na ordem de exibição. */
export const NAVIGATION: readonly NavigationEntry[] = [
  { route: ROUTES.quotes, label: "Orçamentos", icon: "file-text" },
  { route: ROUTES.products, label: "Produtos", icon: "package" },
  { route: ROUTES.customers, label: "Clientes", icon: "users" },
  { route: ROUTES.settings, label: "Configurações", icon: "gear" },
];

/** Rotas sem item próprio na barra: herdam o destaque do item informado. */
const ROUTE_PARENT: Partial<Record<RouteName, RouteName>> = {
  [ROUTES.quoteCreate]: ROUTES.quotes,
};

export function activeNavigationRoute(route: RouteName): RouteName {
  return ROUTE_PARENT[route] ?? route;
}
