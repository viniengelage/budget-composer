import { useMemo } from "react";

import { Button } from "@/components/ui";
import { DataTable, type ColumnDef } from "@/lib/data-table/data-table";
import { formatCurrency, unitLabel } from "@shared/format";
import type { Product } from "@shared/types";

export interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "name",
        header: "Produto",
        accessorFn: (product) => product.name,
        cell: ({ row }) => (
          <>
            <span className="block font-semibold">{row.original.name}</span>
            {row.original.description === "" ? null : (
              <span className="block text-sm text-content-muted">
                {row.original.description}
              </span>
            )}
          </>
        ),
      },
      {
        id: "unit",
        header: "Unidade",
        accessorFn: (product) => unitLabel(product.unit),
        meta: { headerClassName: "w-40", cellClassName: "w-40" },
      },
      {
        id: "price",
        header: "Preço",
        accessorFn: (product) => product.unitPrice,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            {formatCurrency(row.original.unitPrice)}
          </span>
        ),
        meta: { headerClassName: "w-44", cellClassName: "w-44" },
      },
      {
        id: "actions",
        header: "Ações",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              label="Editar"
              icon="pencil-simple"
              variant="secondary"
              size="sm"
              onClick={() => onEdit(row.original)}
              aria-label={`Editar ${row.original.name}`}
            />
            <Button
              label="Excluir"
              icon="trash"
              variant="secondary"
              size="sm"
              className="text-content-danger"
              onClick={() => onDelete(row.original)}
              aria-label={`Excluir ${row.original.name}`}
            />
          </div>
        ),
        meta: { headerClassName: "w-64", cellClassName: "w-64" },
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <DataTable
        caption="Produtos cadastrados, com unidade de medida e preço"
        data={products}
        columns={columns}
        initialSorting={[{ id: "name", desc: false }]}
        rowKey={(product) => product.id}
      />
    </div>
  );
}
