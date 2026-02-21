"use client";

import type { NavCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MainDesktopNavigationMenuProps {
  navCategories: NavCategory[];
}

const MainDesktopNavigationMenu = ({ navCategories }: MainDesktopNavigationMenuProps) => {
  const currentPath = usePathname();
  return (
    <>
      <div className="hidden gap-x-6 md:flex">
        {navCategories.map((category) => (
          <Link
            href={category.slug ? `/category/${category.slug}` : "#"}
            key={category.id}
            className={cn(
              "relative inline-flex items-center rounded-full px-4 py-1.5 text-base font-semibold tracking-tight antialiased ring-1 ring-transparent transition duration-200 [word-spacing:-5px] active:scale-[96%] active:ring-white/20",
              {
                "bg-white/10 px-4 text-white ring-1 ring-white/20":
                  currentPath === (category.slug ? `/category/${category.slug}` : ""),
              },
              {
                "text-gray-300 bg-transparent ring-transparent hover:bg-white/10 hover:text-white hover:ring-1 hover:ring-white/20":
                  currentPath !== (category.slug ? `/category/${category.slug}` : ""),
              },
            )}
          >
            <div className="relative">{category.title ?? category.slug ?? "Category"}</div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default MainDesktopNavigationMenu;
