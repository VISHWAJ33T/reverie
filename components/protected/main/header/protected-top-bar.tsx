"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const ProtectedTopBar = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const path = currentPath.split("/");
  return (
    <>
      {path.length > 3 ? (
        <button
          type="button"
          onClick={() => router.back()}
          className="relative flex flex-1 items-center text-gray-300 hover:text-white"
        >
          <ArrowLeftIcon
            className="mr-2 h-5 w-5"
            aria-hidden="true"
          />
          <span className="text-sm">Go Back</span>
        </button>
      ) : (
        <Link href="/" className="relative flex flex-1 items-center text-gray-300 hover:text-white">
          <ArrowLeftIcon
            className="mr-2 h-5 w-5"
            aria-hidden="true"
          />
          <span className="text-sm">Go Back to Homepage</span>
        </Link>
      )}
    </>
  );
};

export default ProtectedTopBar;
