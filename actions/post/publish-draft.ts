"use server";

import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function PublishDraft(draftId: string): Promise<
  ActionResult<{ postSlug: string }>
> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return actionError("Not authenticated");

    const { data: draft, error: fetchError } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .eq("author_id", user.id)
      .single();

    if (fetchError || !draft) {
      return actionError("Draft not found");
    }

    if (draft.status === "published") {
      return actionError("This draft is already published");
    }

    const now = new Date().toISOString();
    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert({
        author_id: draft.author_id,
        category_id: draft.category_id,
        title: draft.title,
        slug: draft.slug,
        description: draft.description,
        content: draft.content,
        image: draft.image,
        published: true,
        updated_at: now,
      })
      .select("id, slug")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return actionError("A post with this slug already exists. Change the slug and try again.");
      }
      console.error("[PublishDraft Error]", insertError.message);
      return actionError(insertError.message);
    }

    // Cover image is stored at author_id/draft_id/filename; public URLs use author_id/post_id/filename.
    // Copy the file to the post path so the published post page can load it.
    const bucket =
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_COVER_IMAGE || "cover-image";
    if (draft.image?.trim() && draft.author_id && post?.id) {
      const fromPath = `${draft.author_id}/${draftId}/${draft.image.trim()}`;
      const toPath = `${draft.author_id}/${post.id}/${draft.image.trim()}`;
      const { error: copyError } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath);
      if (copyError) {
        console.error("[PublishDraft] Cover image copy failed:", copyError.message);
        // Don't fail publish; post still has image filename, might be at draft path for editor
      }
    }

    await supabase
      .from("drafts")
      .update({ status: "published", post_id: post?.id ?? null })
      .eq("id", draftId);

    return actionSuccess({
      postSlug: post?.slug ?? draft.slug ?? "",
    });
  } catch (error) {
    console.error("[PublishDraft Error]", error);
    return actionError("Failed to publish");
  }
}
