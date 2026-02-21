import type { NavCategory } from "@/lib/categories";
import { mainFooterConfig } from "@/config/main";
import Link from "next/link";

interface MainFooterProps {
  navCategories?: NavCategory[];
}

const MainFooter = ({ navCategories = [] }: MainFooterProps) => {
  return (
    <footer
      className="border-t border-white/10 bg-black shadow-sm"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-16">
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Categories
            </h3>
            <ul role="list" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 sm:justify-start sm:gap-y-4">
              {navCategories.length === 0 ? (
                <li className="text-sm text-gray-500">No categories yet</li>
              ) : (
                navCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={
                        category.slug ? `/category/${category.slug}` : "#"
                      }
                      className="text-sm leading-6 text-gray-400 transition hover:text-white hover:underline"
                    >
                      {category.title ?? category.slug ?? "Category"}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Pages
            </h3>
            <ul role="list" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 sm:justify-start sm:gap-y-4">
              {mainFooterConfig.pages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={page.slug}
                    className="text-sm leading-6 text-gray-400 transition hover:text-white hover:underline"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
