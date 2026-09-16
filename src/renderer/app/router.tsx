import { PlaceholderRoute } from "@/app/routes/placeholder-route";
import { ProductsRoute } from "@/app/routes/products-route";
import { QuotesRoute } from "@/app/routes/quotes-route";
import { ROUTES, type RouteName } from "@/config/routes";

export function Router({ route }: { route: RouteName }) {
  switch (route) {
    case ROUTES.quotes:
      return <QuotesRoute />;

    case ROUTES.products:
      return <ProductsRoute />;

    case ROUTES.quoteCreate:
      return (
        <PlaceholderRoute
          title="Novo orçamento"
          subtitle="Monte o orçamento em três passos"
          icon="note-pencil"
          description="A tela de montar orçamento é o próximo passo. Por enquanto, volte para a lista pelo menu ao lado."
        />
      );

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
      return (
        <PlaceholderRoute
          title="Configurações"
          subtitle="Os dados da sua empresa que saem impressos no orçamento"
          icon="gear"
          description="Aqui vão entrar o nome, o telefone, o endereço, a chave Pix e a logo que aparecem no papel entregue ao cliente."
        />
      );

    default:
      return <QuotesRoute />;
  }
}
