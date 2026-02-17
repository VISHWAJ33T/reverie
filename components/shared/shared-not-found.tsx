import MainFooter from "@/components/main/footer/main-footer";
import type { NavCategory } from "@/lib/categories";
import { sharedNotFoundConfig } from "@/config/shared";
import { LogoIcon } from "@/icons";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";

interface SharedNotFoundProps {
  navCategories?: NavCategory[];
}

const SharedNotFound = ({ navCategories = [] }: SharedNotFoundProps) => {
  return (
    <div className="bg-white">
      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 sm:pb-24 lg:px-8">
        <LogoIcon className="mx-auto h-14 w-14" />
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xl font-semibold leading-8 text-gray-900">404</p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {sharedNotFoundConfig.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-500 sm:mt-6 sm:text-lg sm:leading-8">
            {sharedNotFoundConfig.description}
          </p>
        </div>
        <div className="mx-auto mt-5 flow-root max-w-lg sm:mt-10">
          <h2 className="sr-only">{sharedNotFoundConfig.menu}</h2>
          <ul role="list" className="divide-y divide-gray-900/5">
            {navCategories.map((category) => {
              const Icon = getCategoryIcon(category?.slug ?? "");
              return (
                <Link
                  key={category.id}
                  href={category.slug ? `/category/${category.slug}` : "#"}
                >
                  <li className="relative flex gap-x-6 border-b border-black/5 py-6">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm ring-1 ring-gray-900/10">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="my-auto flex-auto items-center text-sm font-semibold leading-6 text-gray-900">
                      {category.title ?? category.slug ?? "Category"}
                    </div>
                    <div className="flex-none self-center">
                      <ChevronRightIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                </Link>
              );
            })}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className="rounded-md bg-gray-100 px-10 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-200"
            >
              {sharedNotFoundConfig.back}
            </Link>
          </div>
        </div>
      </main>
      <MainFooter navCategories={navCategories ?? []} />
    </div>
  );
};

export default SharedNotFound;
