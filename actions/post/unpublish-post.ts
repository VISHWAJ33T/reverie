"use server";

import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function UnpublishPost(draftId: string): Promise<ActionResult<void>> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return actionError("Not authenticated");

    const { data: draft, error: fetchError } = await supabase
      .from("drafts")
      .select("id, status, post_id, author_id")
      .eq("id", draftId)
      .eq("author_id", user.id)
      .single();

    if (fetchError || !draft) {
      return actionError("Draft not found");
    }

    if (draft.status !== "published") {
      return actionError("This post is not published");
    }

    if (draft.post_id) {
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", draft.post_id);

      if (deleteError) {
        console.error("[UnpublishPost Error]", deleteError.message);
        return actionError(deleteError.message);
      }
    }

    await supabase
      .from("drafts")
      .update({ status: "draft", post_id: null })
      .eq("id", draftId);

    return actionSuccess(undefined);
  } catch (error) {
    console.error("[UnpublishPost Error]", error);
    return actionError("Failed to unpublish");
  }
}
