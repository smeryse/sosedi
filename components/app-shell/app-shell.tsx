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
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}><AppSidebar items={items} /></Suspense>
      <div className="min-w-0 lg:pl-[252px]">
        <AppHeader owner={owner} />
        <main className="px-4 pb-24 pt-4 sm:px-5 lg:pb-8 lg:pt-2">
          <div className="mx-auto w-full max-w-[1668px]">{children}</div>
        </main>
      </div>
      {!owner ? <Suspense fallback={null}><MobileNav /></Suspense> : null}
    </div>
  );
}
