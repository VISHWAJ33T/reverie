"use server";

import { getCurrentUserIsAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ProfileListItem = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  is_admin: boolean;
};

export async function getProfilesForAdmin(): Promise<ProfileListItem[] | null> {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, email, is_admin")
    .order("full_name", { ascending: true, nullsFirst: false });

  if (error) return null;
  return data ?? [];
}
