import { StyleSheet, View } from "react-native";

import { PlaceholderRoute } from "@/app/routes/placeholder-route";
import { ProductsRoute } from "@/app/routes/products-route";
import { QuotesRoute } from "@/app/routes/quotes-route";
import { Sidebar } from "@/components/layouts/sidebar";
import { ROUTES, type RouteName } from "@/config/routes";
import { useCompany } from "@/features/company/hooks/use-company";
import { useNavigationStore } from "@/stores/navigation-store";
import { color } from "@/styles/tokens";

const APP_VERSION = "1.0";

function renderRoute(route: RouteName) {
  switch (route) {
    case ROUTES.quotes:
      return <QuotesRoute />;
    case ROUTES.products:
      return <ProductsRoute />;
    case ROUTES.quoteCreate:
      return (
        <PlaceholderRoute
          title="Novo orçamento"
          subtitle="Preencha os dados abaixo. O total é calculado sozinho."
          icon="file-text"
          description="O formulário de orçamento é a próxima etapa. O desenho está no board 'App / 02 — Novo orçamento' do Penpot."
        />
      );
    case ROUTES.customers:
      return (
        <PlaceholderRoute
          title="Clientes"
          subtitle="Seus clientes ficam salvos para reaproveitar nos próximos orçamentos"
          icon="users"
          description="A lista de clientes vem depois do formulário de orçamento — é ele que alimenta o cadastro."
        />
      );
    case ROUTES.settings:
      return (
        <PlaceholderRoute
          title="Configurações"
          subtitle="Estes dados aparecem no cabeçalho de todos os orçamentos"
          icon="gear"
          description="O desenho está no board 'App / 05 — Configurações · Empresa' do Penpot."
        />
      );
  }
}

export function Router() {
  const route = useNavigationStore((state) => state.route);
  const navigate = useNavigationStore((state) => state.navigate);
  const { data: company } = useCompany();

  return (
    <View style={styles.shell}>
      <Sidebar
        // Antes de configurar a empresa, a barra mostra um nome neutro
        // em vez de um espaço em branco.
        companyName={company?.name?.trim() || "Minha empresa"}
        currentRoute={route}
        onNavigate={navigate}
        onHelp={handleHelp}
        appVersion={APP_VERSION}
      />
      <View style={styles.content}>{renderRoute(route)}</View>
    </View>
  );
}

// TODO(fase 2): abrir a janela de ajuda.
function handleHelp() {}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: "row", backgroundColor: color.bg.canvas },
  content: { flex: 1 },
});
