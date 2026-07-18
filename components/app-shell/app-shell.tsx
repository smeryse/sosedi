import type { ReactNode } from "react";
import { Suspense } from "react";
import type { NavigationItem } from "./navigation";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";

export function AppShell({
  children,
  items,
  owner = false,
}: {
  children: ReactNode;
  items: NavigationItem[];
  owner?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#111111]">
      <Suspense fallback={null}>
        <AppSidebar items={items} />
      </Suspense>
      <div className="min-w-0 lg:pl-[248px]">
        <AppHeader owner={owner} />
        <main className="px-4 pb-20 pt-3 sm:px-6 lg:pb-10 lg:pt-3">
          <div className="mx-auto w-full max-w-[1640px]">{children}</div>
        </main>
      </div>
      {!owner ? (
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      ) : null}
    </div>
  );
}
