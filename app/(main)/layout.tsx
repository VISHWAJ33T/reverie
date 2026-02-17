import { MainFooter, MainGrid, MainHeader } from "@/components/main";
import { getNavCategories } from "@/lib/categories";
import { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const navCategories = await getNavCategories();

  return (
    <>
      <MainHeader navCategories={navCategories} />
      <MainGrid>
        <div className="min-h-full py-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">{children}</div>
          </div>
        </div>
      </MainGrid>
      <MainFooter navCategories={navCategories} />
    </>
  );
}
