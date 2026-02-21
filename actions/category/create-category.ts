"use server";

import type { Category } from "@/lib/categories";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { categoryCreateSchema } from "@/lib/validation/category";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import * as z from "zod";

export async function CreateCategory(
  context: z.infer<typeof categoryCreateSchema>
): Promise<ActionResult<Category>> {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) return actionError("Only admins can create categories.");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  try {
    const data = categoryCreateSchema.parse(context);

    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        title: data.title,
        slug: data.slug,
        show_in_nav: data.show_in_nav,
        sort_order: data.sort_order,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return actionError("A category with this slug already exists.");
      }
      console.error("[CreateCategory Error]", error.message);
      return actionError(error.message);
    }

    return actionSuccess(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return actionError(error.errors[0]?.message ?? "Invalid data");
    }
    console.error("[CreateCategory Error]", error);
    return actionError("Failed to create category");
  }
}
