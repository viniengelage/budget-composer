import { useState } from "react";

import { PrintLayer } from "@/app/print-layer";
import { AppProvider } from "@/app/provider";
import { Router } from "@/app/router";
import { Sidebar } from "@/components/layouts/sidebar";
import { ROUTES } from "@/config/routes";
import { useAppInfo, useCompany } from "@/features/company/api/company";
import { useApplyUpdate, useUpdateState } from "@/features/updates/api/updates";
import { UpdateBanner } from "@/features/updates/components/update-banner";
import { useNavigationStore } from "@/stores/navigation-store";

export function App() {
  return (
    <AppProvider>
      <AppShell />
      <PrintLayer />
    </AppProvider>
  );
}

function UpdateSlot() {
  const [dismissed, setDismissed] = useState(false);
  const { data: update } = useUpdateState();
  const applyUpdate = useApplyUpdate();

  if (dismissed || update?.state !== "ready") return null;

  return (
    <UpdateBanner
      version={update.version}
      applying={applyUpdate.isPending}
      error={applyUpdate.error?.message ?? null}
      onApply={() => applyUpdate.mutate()}
      onDismiss={() => setDismissed(true)}
    />
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
        appVersion={info?.version ?? "…"}
      />
      <main className="flex min-w-0 flex-1 flex-col bg-canvas">
        <UpdateSlot />
        <Router route={route} />
      </main>
    </div>
  );
}
