import { PrintLayer } from "@/app/print-layer";
import { AppProvider } from "@/app/provider";
import { Router } from "@/app/router";
import { Sidebar } from "@/components/layouts/sidebar";
import { ROUTES } from "@/config/routes";
import { useAppInfo, useCompany } from "@/features/company/api/company";
import { useNavigationStore } from "@/stores/navigation-store";
import { APP_VERSION } from "@shared/app-info";

export function App() {
  return (
    <AppProvider>
      <AppShell />
      <PrintLayer />
    </AppProvider>
  );
}

function AppShell() {
  const route = useNavigationStore((state) => state.route);
  const navigate = useNavigationStore((state) => state.navigate);

  const { data: company } = useCompany();
  const { data: info } = useAppInfo();

  const companyName =
    company?.name === undefined || company.name === "" ? "Sua empresa" : company.name;

  return (
    <div className="app-shell flex h-full">
      <Sidebar
        companyName={companyName}
        currentRoute={route}
        onNavigate={navigate}
        onHelp={() => navigate(ROUTES.settings)}
        appVersion={info?.version ?? APP_VERSION}
      />
      <main className="flex min-w-0 flex-1 flex-col bg-canvas">
        <Router route={route} />
      </main>
    </div>
  );
}
