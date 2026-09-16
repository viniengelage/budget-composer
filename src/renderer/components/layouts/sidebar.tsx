import { Icon } from "@/components/ui";
import {
  NAVIGATION,
  activeNavigationRoute,
  type NavigationEntry,
  type RouteName,
} from "@/config/routes";
import { cn } from "@/utils/cn";

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
    <nav
      aria-label="Menu principal"
      className="flex w-65 shrink-0 flex-col bg-sidebar px-5 py-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sidebar-active font-bold text-white"
        >
          {initialsOf(companyName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-on-sidebar">
            {companyName}
          </span>
          <span className="block text-xs text-on-sidebar-muted">Orçamentos</span>
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {NAVIGATION.map((entry) => (
          <li key={entry.route}>
            <NavItem
              entry={entry}
              active={entry.route === active}
              onClick={() => onNavigate(entry.route)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-2">
        <NavItem
          entry={{ route: "quotes", label: "Ajuda", icon: "question" }}
          active={false}
          onClick={onHelp}
        />
        <p className="px-3.5 text-xs text-on-sidebar-muted">Versão {appVersion}</p>
      </div>
    </nav>
  );
}

function NavItem({
  entry,
  active,
  onClick,
}: {
  entry: NavigationEntry;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-13 w-full items-center gap-3 rounded-md px-3.5 text-left",
        "cursor-pointer transition-colors duration-150",
        active
          ? "bg-sidebar-active font-semibold text-on-sidebar"
          : "text-on-sidebar-muted hover:bg-ink-700 hover:text-on-sidebar",
      )}
    >
      <Icon name={entry.icon} size={22} />
      {entry.label}
    </button>
  );
}

function initialsOf(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .slice(0, 2);

  if (parts.length === 0) return name.slice(0, 2).toUpperCase() || "OG";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
