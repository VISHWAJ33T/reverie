import type { NavCategory } from "@/lib/categories";
import { LoginMenu } from "@/components/login";
import { LogoIcon } from "@/icons";
import Link from "next/link";
import React from "react";
import { MainDesktopNavigationMenu } from "./menu";

interface MainDesktopNavigationProps {
  navCategories: NavCategory[];
}

const MainDesktopNavigation = ({ navCategories }: MainDesktopNavigationProps) => {
  return (
    <>
      <nav className="mx-auto hidden max-w-5xl items-center justify-between px-2 py-2 md:flex">
        {/* Logo: black container, white icon, 3:2 aspect ratio */}
        <div className="flex flex-1 justify-start">
          <Link href="/" className="flex shrink-0 items-center">
            <div className="flex h-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black aspect-3/2">
              <LogoIcon className="h-12 max-h-12" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div>
          <div className="flex flex-1 gap-x-6 py-2">
            <MainDesktopNavigationMenu navCategories={navCategories} />
          </div>
        </div>

        {/* Login / profile */}
        <div className="flex flex-1 justify-end">
          <LoginMenu />
        </div>
      </nav>
    </>
  );
};

export default MainDesktopNavigation;
