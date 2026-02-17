import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type NavCategory = {
  id: string;
  title: string | null;
  slug: string | null;
};

export type Category = NavCategory & {
  created_at: string | null;
  show_in_nav: boolean;
  sort_order: number;
};

export async function getNavCategories(): Promise<NavCategory[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("categories")
    .select("id, title, slug")
    .eq("show_in_nav", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getNavCategories]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("categories")
    .select("id, title, slug, created_at, show_in_nav, sort_order")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    console.error("[getAllCategories]", error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string | null,
    slug: row.slug as string | null,
    created_at: row.created_at as string | null,
    show_in_nav: (row.show_in_nav as boolean) ?? true,
    sort_order: (row.sort_order as number) ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}
