"use server";

import { getCurrentUserIsAdmin } from "@/lib/auth";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function updateAboutPage(content: string): Promise<ActionResult<boolean>> {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) return actionError("Only admins can update the about page.");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: row } = await supabase
    .from("about_page")
    .select("id")
    .limit(1)
    .single();
  if (!row?.id) return actionError("About page content not found.");

  const { error } = await supabase
    .from("about_page")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (error) {
    console.error("[updateAboutPage]", error.message);
    return actionError(error.message);
  }
  return actionSuccess(true);
}
