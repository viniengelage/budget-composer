import type { IconName } from "@/components/ui";

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

export const NAVIGATION: readonly NavigationEntry[] = [
  { route: ROUTES.quotes, label: "Orçamentos", icon: "file-text" },
  { route: ROUTES.products, label: "Produtos", icon: "package" },
  { route: ROUTES.customers, label: "Clientes", icon: "users" },
  { route: ROUTES.settings, label: "Configurações", icon: "gear" },
];

const ROUTE_PARENT: Partial<Record<RouteName, RouteName>> = {
  [ROUTES.quoteCreate]: ROUTES.quotes,
};

export function activeNavigationRoute(route: RouteName): RouteName {
  return ROUTE_PARENT[route] ?? route;
}
