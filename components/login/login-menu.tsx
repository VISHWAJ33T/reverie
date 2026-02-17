"use client";

import { Profile } from "@/types/collection";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import LoginButton from "./login-button";
import LoginProfileButton from "./login-profile-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LoginMenu = () => {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setAvatarUrl("");
      return;
    }
    async function fetchAvatar() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single<Profile>();
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    }
    fetchAvatar();
  }, [session, supabase]);

  return (
    <>
      {session ? (
        <LoginProfileButton profileImageUrl={avatarUrl} />
      ) : (
        <LoginButton />
      )}
    </>
  );
};

export default LoginMenu;
