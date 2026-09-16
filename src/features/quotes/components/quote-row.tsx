import { StyleSheet, View } from "react-native";

import { Button, StatusBadge, Text } from "@/components/ui";
import { calculateQuoteTotals } from "@/features/quotes/utils/calculate-quote";
import { color, space } from "@/styles/tokens";
import type { Quote } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

export interface QuoteRowProps {
  quote: Quote;
  onOpen: (quote: Quote) => void;
  onExportPdf: (quote: Quote) => void;
}

export function QuoteRow({ quote, onOpen, onExportPdf }: QuoteRowProps) {
  const { total } = calculateQuoteTotals(quote.items, quote.discount, quote.surcharge);
  const location = [quote.customer.city, quote.customer.district]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.row}>
      <Text variant="bodyStrong" style={styles.colNumber}>
        {quote.number}
      </Text>

      <View style={styles.colCustomer}>
        <Text variant="body" numberOfLines={1} style={styles.customerName}>
          {quote.customer.name}
        </Text>
        {location ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {location}
          </Text>
        ) : null}
      </View>

      <Text variant="body" style={styles.colDate}>
        {formatDate(quote.issuedAt)}
      </Text>
      <Text variant="bodyStrong" style={styles.colTotal}>
        {formatCurrency(total)}
      </Text>

      <View style={styles.colStatus}>
        <StatusBadge status={quote.status} />
      </View>

      <View style={styles.colActions}>
        <Button
          label="Abrir"
          variant="secondary"
          size="sm"
          onPress={() => onOpen(quote)}
        />
        <Button
          label="PDF"
          icon="file-pdf"
          variant="secondary"
          size="sm"
          onPress={() => onExportPdf(quote)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space[6],
    paddingVertical: space[3],
    minHeight: 76,
    borderTopWidth: 1,
    borderTopColor: color.border.default,
  },
  colNumber: { width: 70 },
  colCustomer: { flex: 1, gap: 2, paddingRight: space[4] },
  customerName: { fontWeight: "500" },
  colDate: { width: 130 },
  colTotal: { width: 150 },
  colStatus: { width: 150 },
  colActions: { width: 260, flexDirection: "row", gap: space[2] },
});
