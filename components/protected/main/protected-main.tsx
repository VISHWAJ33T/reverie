"use client";

import { FC, ReactNode, useState } from "react";
import {
  ProtectedMobileMenuButton,
  ProtectedProfileDropDown,
  ProtectedTopBar,
} from "./header";
import { ProtectedDesktopSideBar, ProtectedMobileSideBar } from "./sidebars";

interface ProtectedMainProps {
  children?: ReactNode;
  isAdmin?: boolean;
}

const ProtectedMain: FC<ProtectedMainProps> = ({ children, isAdmin = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  return (
    <>
      <ProtectedMobileSideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={isAdmin}
      />
      <ProtectedDesktopSideBar isAdmin={isAdmin} />
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-black px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <ProtectedMobileMenuButton setSidebarOpen={setSidebarOpen} />

          {/* Separator */}
          <div className="h-6 w-px bg-white/10 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <ProtectedTopBar />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Separator */}
              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10"
                aria-hidden="true"
              />

              <ProtectedProfileDropDown />
            </div>
          </div>
        </div>
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  );
};

export default ProtectedMain;
