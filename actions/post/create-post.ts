"use server";

import { postCreateSchema } from "@/lib/validation/post";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { Draft } from "@/types/collection";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import * as z from "zod";

export async function CreatePost(
  context: z.infer<typeof postCreateSchema>
): Promise<ActionResult<Draft>> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  try {
    const post = postCreateSchema.parse(context);
    const { data, error } = await supabase
      .from("drafts")
      .insert({
        title: post.title,
        author_id: post.user_id,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("[CreatePost Error]", error.message);
      return actionError(error.message);
    }
    return actionSuccess(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[CreatePost Validation Error]", error.errors);
      return actionError("Invalid input data");
    }
    console.error("[CreatePost Error]", error);
    return actionError("Failed to create post");
  }
}
