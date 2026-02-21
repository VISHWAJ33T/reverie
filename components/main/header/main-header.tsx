import type { NavCategory } from "@/lib/categories";
import { MainDesktopNavigation, MainMobileNavigation } from "./navigations";

interface MainHeaderProps {
  navCategories: NavCategory[];
}

export default function MainHeader({ navCategories }: MainHeaderProps) {
  return (
    <div className="border-y border-white/10 sticky top-0 z-50 bg-black shadow-sm backdrop-blur-lg">
      <MainDesktopNavigation navCategories={navCategories} />
      <MainMobileNavigation navCategories={navCategories} />
    </div>
  );
}
