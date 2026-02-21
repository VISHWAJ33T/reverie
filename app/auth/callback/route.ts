import { getUrl } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the Auth Helpers package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectParam = requestUrl.searchParams.get("redirect");

  const getSafeRedirectPath = (value: string | null): string => {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return "/dashboard";

    // Only allow relative redirects to prevent malformed URLs/open redirects.
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return "/dashboard";
    }

    if (trimmed.startsWith("/")) return trimmed;
    return `/${trimmed}`;
  };

  const redirectUrl = new URL(getSafeRedirectPath(redirectParam), requestUrl.origin);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user?.email) {
      // Sync email to profiles for admin Users page (idempotent upsert of profile row)
      await supabase
        .from("profiles")
        .update({ email: sessionData.user.email })
        .eq("id", sessionData.user.id);
    }
    if (!error) {
      // URL to redirect to after sign in process completes
      return NextResponse.redirect(redirectUrl);
    }
    // Log the error for debugging
    console.error("[Auth Callback Error]", {
      message: error.message,
      status: error.status,
      name: error.name,
    });
  } else {
    console.error("[Auth Callback Error] No code parameter received in callback URL");
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
}
