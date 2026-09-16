import { create } from "zustand";

import { ROUTES, type RouteName } from "@/config/routes";

interface NavigationState {
  route: RouteName;
  previousRoute: RouteName | null;
  navigate: (route: RouteName) => void;
  goBack: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  route: ROUTES.quotes,
  previousRoute: null,

  navigate: (route) => {
    if (get().route === route) return;
    set((state) => ({ route, previousRoute: state.route }));
  },

  goBack: () =>
    set((state) => ({
      route: state.previousRoute ?? ROUTES.quotes,
      previousRoute: null,
    })),
}));
