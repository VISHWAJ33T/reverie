"use server";

import type { Category } from "@/lib/categories";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { categoryUpdateSchema } from "@/lib/validation/category";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import * as z from "zod";

export async function UpdateCategory(
  context: z.infer<typeof categoryUpdateSchema>
): Promise<ActionResult<Category>> {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) return actionError("Only admins can update categories.");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  try {
    const data = categoryUpdateSchema.parse(context);

    if (!data.id) return actionError("Category ID is required");

    const { data: category, error } = await supabase
      .from("categories")
      .update({
        title: data.title,
        slug: data.slug,
        show_in_nav: data.show_in_nav,
        sort_order: data.sort_order,
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return actionError("A category with this slug already exists.");
      }
      console.error("[UpdateCategory Error]", error.message);
      return actionError(error.message);
    }

    return actionSuccess(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return actionError(error.errors[0]?.message ?? "Invalid data");
    }
    console.error("[UpdateCategory Error]", error);
    return actionError("Failed to update category");
  }
}
