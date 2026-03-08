"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  type SingleParser,
  type UseQueryStateOptions,
  useQueryState,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getSortingStateParser } from "@/lib/parsers";
import type { ExtendedColumnSort } from "@/types/data-table";

const ARRAY_SEPARATOR = ",";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

interface UseDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  initialSorting?: ExtendedColumnSort<TData>[];
  pageSize?: number;
}

export function useDataTable<TData>({ data, columns, initialSorting = [], pageSize = 10 }: UseDataTableProps<TData>) {
  const queryStateOptions = React.useMemo<Omit<UseQueryStateOptions<string>, "parse">>(
    () => ({
      history: "replace" as const,
      scroll: false,
      shallow: true,
      throttleMs: THROTTLE_MS,
      clearOnDefault: true,
    }),
    []
  );

  // Column visibility stays in React state (no URL sync needed)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // --- Pagination: synced to URL ---
  const [page, setPage] = useQueryState("page", parseAsInteger.withOptions(queryStateOptions).withDefault(1));
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withOptions(queryStateOptions).withDefault(pageSize)
  );

  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: perPage,
    }),
    [page, perPage]
  );

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const next = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
      void setPage(next.pageIndex + 1);
      void setPerPage(next.pageSize);
    },
    [pagination, setPage, setPerPage]
  );

  // --- Sorting: synced to URL ---
  const columnIds = React.useMemo(
    () =>
      new Set(
        columns.map((col) => col.id ?? (col as { accessorKey?: string }).accessorKey).filter(Boolean) as string[]
      ),
    [columns]
  );

  const [sorting, setSorting] = useQueryState(
    "sort",
    getSortingStateParser<TData>(columnIds).withOptions(queryStateOptions).withDefault(initialSorting)
  );

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const next = typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
      void setSorting(next as ExtendedColumnSort<TData>[]);
    },
    [sorting, setSorting]
  );

  // --- Column Filters: synced to URL ---
  const filterableColumns = React.useMemo(() => columns.filter((column) => column.enableColumnFilter), [columns]);

  const filterParsers = React.useMemo(() => {
    return filterableColumns.reduce<Record<string, SingleParser<string> | SingleParser<string[]>>>((acc, column) => {
      const id = column.id ?? (column as { accessorKey?: string }).accessorKey ?? "";
      if (column.meta?.options) {
        acc[id] = parseAsArrayOf(parseAsString, ARRAY_SEPARATOR).withOptions(queryStateOptions);
      } else {
        acc[id] = parseAsString.withOptions(queryStateOptions);
      }
      return acc;
    }, {});
  }, [filterableColumns, queryStateOptions]);

  const [filterValues, setFilterValues] = useQueryStates(filterParsers);

  const debouncedSetFilterValues = useDebouncedCallback((values: typeof filterValues) => {
    void setPage(1);
    void setFilterValues(values);
  }, DEBOUNCE_MS);

  // Convert URL filter values -> ColumnFiltersState
  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    return Object.entries(filterValues).reduce<ColumnFiltersState>((filters, [key, value]) => {
      if (value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            filters.push({ id: key, value });
          }
        } else if (typeof value === "string" && value !== "") {
          filters.push({ id: key, value });
        }
      }
      return filters;
    }, []);
  }, [filterValues]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters);

  // Sync initialColumnFilters from URL on mount / URL change
  React.useEffect(() => {
    setColumnFilters(initialColumnFilters);
  }, [initialColumnFilters]);

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      setColumnFilters((prev) => {
        const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;

        const filterUpdates = next.reduce<Record<string, string | string[] | null>>((acc, filter) => {
          if (
            filterableColumns.find((col) => {
              const colId = col.id ?? (col as { accessorKey?: string }).accessorKey;
              return colId === filter.id;
            })
          ) {
            acc[filter.id] = filter.value as string | string[];
          }
          return acc;
        }, {});

        // Clear removed filters
        for (const prevFilter of prev) {
          if (!next.some((filter) => filter.id === prevFilter.id)) {
            filterUpdates[prevFilter.id] = null;
          }
        }

        debouncedSetFilterValues(filterUpdates);
        return next;
      });
    },
    [debouncedSetFilterValues, filterableColumns]
  );

  // --- Build TanStack Table ---
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      columnVisibility,
      columnFilters,
    },
    defaultColumn: {
      enableColumnFilter: false,
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return { table };
}
