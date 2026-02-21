"use client";

import { sharedLoginConfig } from "@/config/shared";
import { GoogleIcon, LoadingDots } from "@/icons";
import { getUrl } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const getLoginRedirectPath = (pathname?: string | null): string => {
  return (
    getUrl() +
    "/auth/callback" +
    "?redirect=" +
    (pathname ? pathname : "/editor/posts")
  );
};

interface LoginSectionProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginSection: React.FC<LoginSectionProps> = () => {
  const supabase = createClient();
  const [signInGoogleClicked, setSignInGoogleClicked] =
    React.useState<boolean>(false);
  const router = useRouter();
  const currentPathname = usePathname();
  const redirectTo = getLoginRedirectPath(currentPathname);

  async function signInWithGoogle() {
    setSignInGoogleClicked(true);
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
    <>
      <div className="mx-auto w-full justify-center rounded-md border border-black/5 bg-gray-50 align-middle shadow-md">
        <div className="flex flex-col items-center justify-center space-y-3 border-b px-4 py-6 pt-8 text-center">
          <Link href="/" className="flex shrink-0">
            <img
              src="/logo.svg"
              alt="Reverie Logo"
              className="h-12 w-12 max-h-12 max-w-12 rounded-full object-contain"
              width={48}
              height={48}
            />
          </Link>
          <h3 className="font-display text-2xl font-bold">
            {sharedLoginConfig.title}
          </h3>
        </div>

        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 md:px-16">
          <button
            disabled={signInGoogleClicked}
            className={`${
              signInGoogleClicked
                ? "cursor-not-allowed border-gray-200 bg-gray-100"
                : "border border-gray-200 bg-white text-black hover:bg-gray-50"
            } flex h-10 w-full items-center justify-center gap-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
            onClick={() => signInWithGoogle()}
          >
            {signInGoogleClicked ? (
              <LoadingDots color="#808080" />
            ) : (
              <>
                <GoogleIcon className="h-5 w-5 shrink-0" />
                <span>{sharedLoginConfig.google}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginSection;
