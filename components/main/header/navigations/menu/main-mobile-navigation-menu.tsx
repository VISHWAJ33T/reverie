"use client";

import { getCategoryIcon } from "@/lib/category-icons";
import type { NavCategory } from "@/lib/categories";
import { Disclosure, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { ExoticComponent, FC, ReactNode } from "react";

interface MainMobileNavigationMenuProps {
  fragment: ExoticComponent<{
    children?: ReactNode | undefined;
  }>;
  navCategories: NavCategory[];
}

const MainMobileNavigationMenu: FC<MainMobileNavigationMenuProps> = ({
  fragment,
  navCategories,
}) => {
  const router = useRouter();

  return (
    <>
      <Transition
        as={fragment}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-300"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Disclosure.Panel className="w-full border-t border-black/5 bg-gray-50 lg:hidden">
          {navCategories.map((category) => {
            const Icon = getCategoryIcon(category.slug);
            return (
              <Disclosure.Button
                key={category.id}
                as="a"
                onClick={() =>
                  router.push(
                    category.slug ? `/category/${category.slug}` : "/",
                  )
                }
              >
                <div className="group flex items-center gap-x-6 border-b border-black/5 px-8 py-3 text-base font-semibold leading-7 text-gray-600 transition-colors hover:bg-gray-200">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-black/10 shadow-md shadow-black/5 transition duration-200 group-hover:bg-gray-50">
                    <Icon className="h-6 w-6" />
                  </div>

                  {category.title ?? category.slug ?? "Category"}
                </div>
              </Disclosure.Button>
            );
          })}
        </Disclosure.Panel>
      </Transition>
    </>
  );
};

export default MainMobileNavigationMenu;
