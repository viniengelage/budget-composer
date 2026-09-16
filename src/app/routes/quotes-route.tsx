import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Page, PageHeader } from "@/components/layouts/app-shell";
import { Button, TextField } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { QuoteList } from "@/features/quotes/components/quote-list";
import { useQuotes } from "@/features/quotes/hooks/use-quotes";
import { useNavigationStore } from "@/stores/navigation-store";
import { space } from "@/styles/tokens";
import type { Quote } from "@/types";
import { onlyDigits } from "@/utils/format";

export function QuotesRoute() {
  const navigate = useNavigationStore((state) => state.navigate);
  const { data: quotes = [], isLoading } = useQuotes();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term === "") return quotes;

    const digits = onlyDigits(term);

    return quotes.filter(
      (quote) =>
        quote.customer.name.toLowerCase().includes(term) ||
        (digits !== "" && String(quote.number).includes(digits)),
    );
  }, [quotes, search]);

  const goToCreate = () => navigate(ROUTES.quoteCreate);

  return (
    <Page
      header={
        <PageHeader
          title="Orçamentos"
          subtitle="Veja, crie e imprima os orçamentos dos seus clientes"
          action={
            <Button label="Novo orçamento" icon="plus" size="lg" onPress={goToCreate} />
          }
        />
      }
    >
      <View style={styles.toolbar}>
        <View style={styles.search}>
          <TextField
            label="Buscar"
            leadingIcon="magnifying-glass"
            placeholder="Buscar pelo nome do cliente ou número"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <QuoteList
        quotes={filtered}
        isLoading={isLoading}
        searchTerm={search.trim()}
        onOpen={handleOpen}
        onExportPdf={handleExport}
        onCreate={goToCreate}
        onClearSearch={() => setSearch("")}
      />
    </Page>
  );
}

function handleOpen(_quote: Quote) {}
function handleExport(_quote: Quote) {}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[4],
    marginBottom: space[5],
  },
  search: { flex: 1, maxWidth: 680 },
});
