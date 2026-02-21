"use server";

import { profileSchema } from "@/lib/validation/profile";
import { ActionResult, actionError, actionSuccess } from "@/types/action";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import * as z from "zod";

export async function UpdateSettings(
  context: z.infer<typeof profileSchema>
): Promise<ActionResult<boolean>> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  try {
    const profile = profileSchema.parse(context);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || profile.firstName,
        username: profile.userName,
        avatar_url: profile.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      console.error("[UpdateSettings Error]", error.message);
      return actionError(error.message);
    }
    return actionSuccess(true);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[UpdateSettings Validation Error]", error.errors);
      return actionError("Invalid profile data");
    }
    console.error("[UpdateSettings Error]", error);
    return actionError("Failed to update settings");
  }
}
