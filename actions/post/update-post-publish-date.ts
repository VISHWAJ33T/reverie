"use server";

import { getCurrentUserIsAdmin } from "@/lib/auth";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * Updates the publish date (published_at) of a post. Admin only.
 * postId is the posts.id (the published post row), not the draft id.
 */
export async function UpdatePostPublishDate(
  postId: string,
  publishedAt: string
): Promise<ActionResult<boolean>> {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) return actionError("Only admins can change the publish date.");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return actionError("Invalid date.");

  const { error } = await supabase
    .from("posts")
    .update({ published_at: date.toISOString() })
    .eq("id", postId);

  if (error) {
    console.error("[UpdatePostPublishDate]", error.message);
    return actionError(error.message);
  }
  return actionSuccess(true);
}
