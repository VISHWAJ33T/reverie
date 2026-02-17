import type { NavCategory } from "@/lib/categories";
import { MainDesktopNavigation, MainMobileNavigation } from "./navigations";

interface MainHeaderProps {
  navCategories: NavCategory[];
}

export default function MainHeader({ navCategories }: MainHeaderProps) {
  return (
    <div className="border-y-1 sticky top-0 z-50 border-black/5 bg-gray-50/60 shadow-sm shadow-gray-300 backdrop-blur-lg">
      <MainDesktopNavigation navCategories={navCategories} />
      <MainMobileNavigation navCategories={navCategories} />
    </div>
  );
}
