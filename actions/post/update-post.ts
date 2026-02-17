"use server";

import { postUpdateSchema } from "@/lib/validation/post";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { Draft } from "@/types/collection";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import * as z from "zod";

export async function UpdatePost(
  context: z.infer<typeof postUpdateSchema>
): Promise<ActionResult<Draft>> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  try {
    const post = postUpdateSchema.parse(context);

    // Validate category exists to avoid FK violation; use null if invalid/empty
    let categoryId: string | null = post.categoryId?.trim() || null;
    if (categoryId) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("id", categoryId)
        .single();
      if (!category) categoryId = null;
    }

    const { data: draft, error: fetchError } = await supabase
      .from("drafts")
      .select("status, post_id")
      .eq("id", post.id)
      .single();

    if (fetchError || !draft) {
      console.error("[UpdatePost Error]", fetchError?.message ?? "Draft not found");
      return actionError(fetchError?.message ?? "Draft not found");
    }

    const { data, error } = await supabase
      .from("drafts")
      .update({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category_id: categoryId,
        description: post.description,
        image: post.image,
        content: post.content,
      })
      .match({ id: post.id })
      .select()
      .single();

    if (error) {
      console.error("[UpdatePost Error]", error.message);
      return actionError(error.message);
    }

    // When the draft is published, sync the same content to the posts row so the live post updates.
    if (draft.status === "published" && draft.post_id) {
      const { error: postError } = await supabase
        .from("posts")
        .update({
          title: post.title,
          slug: post.slug,
          category_id: categoryId,
          description: post.description,
          image: post.image,
          content: post.content,
        })
        .eq("id", draft.post_id);

      if (postError) {
        console.error("[UpdatePost Error syncing to post]", postError.message);
        return actionError(postError.message);
      }
    }

    return actionSuccess(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[UpdatePost Validation Error]", error.errors);
      return actionError("Invalid input data");
    }
    console.error("[UpdatePost Error]", error);
    return actionError("Failed to update post");
  }
}
