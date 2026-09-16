import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { Button, EmptyState, Text } from "@/components/ui";
import { QuoteRow } from "@/features/quotes/components/quote-row";
import { color, radius, space } from "@/styles/tokens";
import type { Quote } from "@/types";

const COLUMNS = [
  { label: "Nº", width: 70 },
  { label: "Cliente", flex: true },
  { label: "Data", width: 130 },
  { label: "Valor", width: 150 },
  { label: "Situação", width: 150 },
  { label: "Ações", width: 260 },
] as const;

export interface QuoteListProps {
  quotes: Quote[];
  isLoading: boolean;
  searchTerm: string;
  onOpen: (quote: Quote) => void;
  onExportPdf: (quote: Quote) => void;
  onCreate: () => void;
  onClearSearch: () => void;
}

export function QuoteList({
  quotes,
  isLoading,
  searchTerm,
  onOpen,
  onExportPdf,
  onCreate,
  onClearSearch,
}: QuoteListProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={color.text.brand} />
        <Text variant="body" tone="secondary">
          Carregando seus orçamentos…
        </Text>
      </View>
    );
  }

  // Busca sem resultado e lista realmente vazia são problemas diferentes,
  // e por isso levam a saídas diferentes.
  if (quotes.length === 0 && searchTerm !== "") {
    return (
      <EmptyState
        icon="magnifying-glass"
        tone="neutral"
        title="Nenhum orçamento encontrado"
        description={`Não achamos nada com “${searchTerm}”. Tente escrever só parte do nome, ou o número do orçamento.`}
      >
        <Button label="Limpar busca" variant="secondary" onPress={onClearSearch} />
      </EmptyState>
    );
  }

  if (quotes.length === 0) {
    return (
      <EmptyState
        icon="file-text"
        title="Você ainda não tem orçamentos"
        description="Tudo pronto para começar. Crie o primeiro orçamento e imprima em PDF em poucos minutos."
      >
        <Button
          label="Criar primeiro orçamento"
          icon="plus"
          size="lg"
          onPress={onCreate}
        />
      </EmptyState>
    );
  }

  return (
    <View style={styles.table}>
      <View style={styles.head}>
        {COLUMNS.map((column) => (
          <Text
            key={column.label}
            variant="overline"
            tone="secondary"
            style={"flex" in column ? styles.headFlex : { width: column.width }}
          >
            {column.label}
          </Text>
        ))}
      </View>

      <FlatList
        data={quotes}
        keyExtractor={(quote) => quote.id}
        renderItem={({ item }) => (
          <QuoteRow quote={item} onOpen={onOpen} onExportPdf={onExportPdf} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    flex: 1,
    backgroundColor: color.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border.default,
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: space[6],
    backgroundColor: color.bg.subtle,
  },
  headFlex: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: space[4] },
});
