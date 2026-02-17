"use client";

import type { TableCategoryOption } from "./data/data";
import { Draft } from "@/types/collection";
import { ColumnDef } from "@tanstack/react-table";
import { safeFormatDate } from "@/lib/date-utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { statuses } from "./data/data";

export function getColumns(categories: TableCategoryOption[]): ColumnDef<Draft>[] {
  return [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "category_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const label = categories.find(
        (category) => category.value === row.original.category_id,
      );

      if (!label) {
        return (
          <span className="text-muted-foreground text-sm">—</span>
        );
      }

      return (
        <div className="flex space-x-2">
          <div className="max-w-[500px] justify-start truncate font-medium">
            <span className="inline-flex items-center rounded-full border border-gray-400 px-3 py-1 text-sm text-gray-500">
              {label.icon && <label.icon className="mr-1 h-4 w-4" />}
              {label.label}
            </span>
          </div>
        </div>
      );
    },
    enableHiding: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const statusValue = row.getValue("status") as string | null;
      const effectiveStatus = statusValue && statusValue !== "" ? statusValue : "draft";
      const status = statuses.find((s) => s.value === effectiveStatus);

      if (!status) {
        return (
          <span className="text-muted-foreground text-sm">
            {effectiveStatus === "draft" ? "Draft" : effectiveStatus}
          </span>
        );
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const statusValue = row.getValue(id) as string | null;
      const effectiveStatus =
        statusValue && statusValue !== "" ? statusValue : "draft";
      return value.includes(effectiveStatus);
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const val = row.getValue("created_at") as string | null | undefined;
      const date = safeFormatDate(val, "MM/dd/yyyy");
      return (
        <div className="flex w-[100px] items-center">
          <span>{date}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableHiding: false,
    enableSorting: false,
  },
];
}
