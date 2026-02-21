"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type AboutPageRow = {
  id: string;
  content: string | null;
  updated_at: string | null;
};

export async function getAboutPage(): Promise<AboutPageRow | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("about_page")
    .select("id, content, updated_at")
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as AboutPageRow;
}
