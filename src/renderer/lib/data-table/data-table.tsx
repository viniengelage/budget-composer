import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/utils/cn";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}

export type { ColumnDef };

export interface DataTableProps<T> {
  /** Lido por leitor de tela; não aparece na tela. */
  caption: string;
  data: T[];
  columns: ColumnDef<T>[];
  initialSorting?: SortingState;
  rowKey: (row: T) => string;
}

const SORT_ICON = {
  asc: "caret-up",
  desc: "caret-down",
  none: "caret-up-down",
} as const;

export function DataTable<T>({
  caption,
  data,
  columns,
  initialSorting = [],
  rowKey,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => rowKey(row),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">{caption}</caption>

      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-line bg-subtle">
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              const sortable = header.column.getCanSort();
              const label = flexRender(
                header.column.columnDef.header,
                header.getContext(),
              );

              return (
                <th
                  key={header.id}
                  scope="col"
                  aria-sort={
                    sorted === "asc"
                      ? "ascending"
                      : sorted === "desc"
                        ? "descending"
                        : undefined
                  }
                  className={cn(
                    "px-6 py-4 text-xs font-semibold tracking-wide text-content-muted uppercase",
                    header.column.columnDef.meta?.headerClassName,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm uppercase hover:text-content"
                    >
                      {label}
                      <Icon
                        name={SORT_ICON[sorted === false ? "none" : sorted]}
                        size={14}
                      />
                    </button>
                  ) : (
                    label
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-line last:border-b-0">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={cn("px-6 py-4", cell.column.columnDef.meta?.cellClassName)}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
