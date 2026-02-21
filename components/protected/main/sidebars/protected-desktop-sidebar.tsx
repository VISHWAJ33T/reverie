import { dashBoardMenu } from "@/config/shared/dashboard";
import { cn, getUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ProtectedDesktopSideBar = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const currentPath = usePathname();
  const path = currentPath.split("/");
  const pathSlug = `/${path.slice(1, 3).join("/")}`;
  const menuItems = dashBoardMenu.filter(
    (m) =>
      m.slug !== "/settings/categories" &&
      m.slug !== "/settings/about" &&
      m.slug !== "/settings/users"
  );
  const adminItems = isAdmin
    ? dashBoardMenu.filter(
        (m) =>
          m.slug === "/settings/categories" ||
          m.slug === "/settings/about" ||
          m.slug === "/settings/users"
      )
    : [];
  const visibleMenu = [...menuItems, ...adminItems];
  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-white/10 bg-black px-6 pb-4">
          <Link href={getUrl()} className="flex h-16 shrink-0 items-center">
            <Image
              className="h-14 max-h-14 aspect-3/2 object-contain"
              src="/logo.png"
              alt="Reverie Logo"
              height={120}
              width={80}
              priority
            />
          </Link>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {visibleMenu.map((menu) => (
                    <li key={menu.slug}>
                      <Link
                        href={menu.slug || ""}
                        className={cn(
                          currentPath === menu.slug ||
                            (path.length > 3 && pathSlug === menu.slug)
                            ? "bg-white/10 text-orange-400"
                            : "text-gray-300 hover:bg-white/10 hover:text-white",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                        )}
                      >
                        <menu.icon
                          className={cn(
                            currentPath === menu.slug
                              ? "text-orange-400"
                              : "text-gray-400 group-hover:text-white",
                            "h-6 w-6 shrink-0",
                          )}
                          aria-hidden="true"
                        />
                        {menu.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default ProtectedDesktopSideBar;
