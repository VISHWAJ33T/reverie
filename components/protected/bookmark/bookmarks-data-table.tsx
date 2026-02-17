"use client";

import { getBookmarkTableColumns } from "./protected-bookmark-table-columns";
import { DataTable } from "@/components/protected/post/table/data-table";
import { categoriesToTableOptions } from "@/components/protected/post/table/data/data";
import type { Category } from "@/lib/categories";
import { Post } from "@/types/collection";

interface BookmarksDataTableProps {
  data: Post[];
  categories: Category[];
}

export function BookmarksDataTable({ data, categories }: BookmarksDataTableProps) {
  const categoryOptions = categoriesToTableOptions(categories);
  return (
    <DataTable
      data={data}
      columns={getBookmarkTableColumns(categoryOptions)}
      categories={categoryOptions}
    />
  );
}
