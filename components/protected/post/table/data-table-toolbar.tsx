"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import type { TableCategoryOption } from "./data/data";
import { statuses } from "./data/data";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  categories?: TableCategoryOption[];
}

export function DataTableToolbar<TData>({
  table,
  categories = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Get column IDs to avoid calling getColumn on non-existent columns
  const columnIds = useMemo(
    () => new Set(table.getAllColumns().map((col) => col.id)),
    [table]
  );

  const hasStatusColumn = columnIds.has("status");
  const hasCategoryColumn = columnIds.has("category_id");

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter posts..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {hasStatusColumn && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {hasCategoryColumn && categories.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("category_id")}
            title="Category"
            options={categories}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
