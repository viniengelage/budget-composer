import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Page, PageHeader } from "@/components/layouts/app-shell";
import { Button, EmptyState, Text } from "@/components/ui";
import { useProducts } from "@/features/products/hooks/use-products";
import { color, space } from "@/styles/tokens";
import { formatCurrency, unitLabel } from "@/utils/format";

export function ProductsRoute() {
  const { data: products = [], isLoading } = useProducts();

  return (
    <Page
      header={
        <PageHeader
          title="Produtos"
          subtitle="Cadastre seus produtos uma vez e use em todos os orçamentos"
          action={
            products.length > 0 ? (
              <Button label="Novo produto" icon="plus" size="lg" onPress={handleCreate} />
            ) : undefined
          }
        />
      }
    >
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={color.text.brand} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.panel}>
          <EmptyState
            icon="package"
            title="Nenhum produto cadastrado"
            description="Cadastre a grama, o frete, o preparo do solo… Depois é só escolher na hora de montar o orçamento, sem digitar o preço de novo."
          >
            <Button
              label="Cadastrar primeiro produto"
              icon="plus"
              size="lg"
              onPress={handleCreate}
            />
          </EmptyState>
        </View>
      ) : (
        <View style={styles.panel}>
          {products.map((product) => (
            <View key={product.id} style={styles.row}>
              <View style={styles.rowMain}>
                <Text variant="body">{product.name}</Text>
                <Text variant="caption" tone="secondary">
                  {product.description}
                </Text>
              </View>
              <Text variant="body" style={styles.unit}>
                {unitLabel(product.unit)}
              </Text>
              <Text variant="bodyStrong" style={styles.price}>
                {formatCurrency(product.unitPrice)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}

// TODO(fase 2): abrir o modal de cadastro de produto.
function handleCreate() {}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: color.bg.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.border.default,
    justifyContent: "center",
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space[6],
    minHeight: 76,
    borderBottomWidth: 1,
    borderBottomColor: color.border.default,
  },
  rowMain: { flex: 1, gap: 2 },
  unit: { width: 160 },
  price: { width: 200 },
});
