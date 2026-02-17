"use client";

import { getColumns } from "@/components/protected/post/table/columns";
import { DataTable } from "@/components/protected/post/table/data-table";
import { categoriesToTableOptions } from "@/components/protected/post/table/data/data";
import type { Category } from "@/lib/categories";
import { Draft } from "@/types/collection";

interface PostsDataTableProps {
  data: Draft[];
  categories: Category[];
}

export function PostsDataTable({ data, categories }: PostsDataTableProps) {
  const categoryOptions = categoriesToTableOptions(categories);
  return (
    <DataTable
      data={data}
      columns={getColumns(categoryOptions)}
      categories={categoryOptions}
    />
  );
}
