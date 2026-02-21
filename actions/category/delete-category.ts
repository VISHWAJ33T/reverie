"use server";

import { getCurrentUserIsAdmin } from "@/lib/auth";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function DeleteCategory(id: string): Promise<ActionResult<boolean>> {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) return actionError("Only admins can delete categories.");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("[DeleteCategory Error]", error.message);
      return actionError(error.message);
    }

    return actionSuccess(true);
  } catch (error) {
    console.error("[DeleteCategory Error]", error);
    return actionError("Failed to delete category");
  }
}
