"use server";

import { getCurrentUserIsAdmin } from "@/lib/auth";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function setUserIsAdmin(
  userId: string,
  isAdmin: boolean
): Promise<ActionResult<boolean>> {
  const currentIsAdmin = await getCurrentUserIsAdmin();
  if (!currentIsAdmin) return actionError("Only admins can change admin status.");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[setUserIsAdmin]", error.message);
    return actionError(error.message);
  }
  return actionSuccess(true);
}
