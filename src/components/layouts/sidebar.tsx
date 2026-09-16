import { Pressable, StyleSheet, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import {
  NAVIGATION,
  activeNavigationRoute,
  type NavigationEntry,
  type RouteName,
} from "@/config/routes";
import { color, control, radius, space } from "@/styles/tokens";

export interface SidebarProps {
  companyName: string;
  currentRoute: RouteName;
  onNavigate: (route: RouteName) => void;
  onHelp: () => void;
  appVersion: string;
}

export function Sidebar({
  companyName,
  currentRoute,
  onNavigate,
  onHelp,
  appVersion,
}: SidebarProps) {
  const active = activeNavigationRoute(currentRoute);

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Text variant="bodyStrong" tone="inverse">
            {initialsOf(companyName)}
          </Text>
        </View>
        <View style={styles.brandText}>
          <Text variant="label" tone="inverse" numberOfLines={1} style={styles.brandName}>
            {companyName}
          </Text>
          <Text variant="caption" tone="onSidebarMuted">
            Orçamentos
          </Text>
        </View>
      </View>

      <View style={styles.nav}>
        {NAVIGATION.map((entry) => (
          <NavItem
            key={entry.route}
            entry={entry}
            active={entry.route === active}
            onPress={() => onNavigate(entry.route)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <NavItem
          entry={{ route: "quotes", label: "Ajuda", icon: "question" }}
          active={false}
          onPress={onHelp}
        />
        <Text variant="caption" tone="onSidebarMuted" style={styles.version}>
          Versão {appVersion}
        </Text>
      </View>
    </View>
  );
}

function NavItem({
  entry,
  active,
  onPress,
}: {
  entry: NavigationEntry;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={entry.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        active && styles.navItemActive,
        !active && pressed && styles.navItemPressed,
      ]}
    >
      <Icon
        name={entry.icon}
        size={22}
        tint={active ? color.text.onSidebar : color.text.onSidebarMuted}
      />
      <Text
        variant="label"
        tone={active ? "inverse" : "onSidebarMuted"}
        style={active ? styles.navLabelActive : undefined}
      >
        {entry.label}
      </Text>
    </Pressable>
  );
}

function initialsOf(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .slice(0, 2);

  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: color.bg.sidebar,
    paddingHorizontal: space[5],
    paddingVertical: space[6],
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    marginBottom: space[6],
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: color.bg.sidebarActive,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { flex: 1 },
  brandName: { fontWeight: "600" },
  nav: { gap: space[2] },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    height: control.md + 4,
    paddingHorizontal: space[3] + 2,
    borderRadius: radius.md,
  },
  navItemActive: { backgroundColor: color.bg.sidebarActive },
  navItemPressed: { backgroundColor: color.text.primary },
  navLabelActive: { fontWeight: "600" },
  footer: { marginTop: "auto", gap: space[2] },
  version: { paddingHorizontal: space[3] + 2 },
});
