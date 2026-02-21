"use client";

import { GoogleIcon } from "@/icons";
import { getUrl } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { sharedLoginConfig } from "@/config/shared";

const getLoginRedirectPath = (pathname?: string | null): string => {
  return (
    getUrl() +
    "/auth/callback" +
    "?redirect=" +
    (pathname ? pathname : "/editor/posts")
  );
};

const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const redirectTo = getLoginRedirectPath(pathname);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "consent" },
      },
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={loading}
      className="flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-70"
    >
      <GoogleIcon className="h-5 w-5 shrink-0" />
      <span>{loading ? "Signing in…" : sharedLoginConfig.google}</span>
    </button>
  );
};

export default LoginButton;
