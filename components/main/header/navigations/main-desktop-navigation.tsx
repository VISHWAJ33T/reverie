import type { NavCategory } from "@/lib/categories";
import { LoginMenu } from "@/components/login";
import { IconWrapperRounded, LogoIcon } from "@/icons";
import Link from "next/link";
import React from "react";
import { MainDesktopNavigationMenu } from "./menu";

interface MainDesktopNavigationProps {
  navCategories: NavCategory[];
}

const MainDesktopNavigation = ({ navCategories }: MainDesktopNavigationProps) => {
  return (
    <>
      <nav className="mx-auto hidden max-w-5xl items-center justify-between px-2 py-4 md:flex">
        {/* Logo */}
        <div className="flex flex-1 justify-start pl-2">
          <Link href="/" className="flex shrink-0 items-center">
            <IconWrapperRounded className="size-10">
              <LogoIcon className="h-8 w-8 max-h-8 max-w-8" />
            </IconWrapperRounded>
          </Link>
        </div>

        {/* Navigation */}
        <div>
          <div className="flex flex-1 gap-x-6">
            <MainDesktopNavigationMenu navCategories={navCategories} />
          </div>
        </div>

        {/* Login Menu */}
        <div className="flex flex-1 justify-end">
          <LoginMenu />
        </div>
      </nav>
    </>
  );
};

export default MainDesktopNavigation;
