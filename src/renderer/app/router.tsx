import { PlaceholderRoute } from "@/app/routes/placeholder-route";
import { ProductsRoute } from "@/app/routes/products-route";
import { QuoteCreateRoute } from "@/app/routes/quote-create-route";
import { QuotesRoute } from "@/app/routes/quotes-route";
import { SettingsRoute } from "@/app/routes/settings-route";
import { ROUTES, type RouteName } from "@/config/routes";

export function Router({ route }: { route: RouteName }) {
  switch (route) {
    case ROUTES.quotes:
      return <QuotesRoute />;

    case ROUTES.products:
      return <ProductsRoute />;

    case ROUTES.quoteCreate:
      return <QuoteCreateRoute />;

    case ROUTES.customers:
      return (
        <PlaceholderRoute
          title="Clientes"
          subtitle="Quem já pediu orçamento para você"
          icon="users"
          description="Os clientes são salvos automaticamente quando você faz um orçamento. Esta tela vai deixar procurar e corrigir os dados deles."
        />
      );

    case ROUTES.settings:
      return <SettingsRoute />;

    default:
      return <QuotesRoute />;
  }
}
