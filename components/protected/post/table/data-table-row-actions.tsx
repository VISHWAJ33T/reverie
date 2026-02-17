"use client";

import PostEditButton from "@/components/protected/post/buttons/post-edit-button";
import { Row } from "@tanstack/react-table";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const id = row.getValue("id") as string;
  const status = (row.getValue("status") as string | null) ?? "draft";
  const slug = (row.original as { slug?: string | null }).slug ?? "";
  return <PostEditButton id={id} status={status} slug={slug} />;
}
