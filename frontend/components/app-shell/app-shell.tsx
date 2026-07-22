import type { ReactNode } from "react";
import type { NavigationItem } from "./navigation";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";
import { AppPageTransition } from "./page-transition";
import { FloatingZhenya } from "@/components/chat/floating-zhenya";
import { FavoritesProvider } from "@/components/favorites-context";

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
    <FavoritesProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AppSidebar items={items} owner={owner} />
        <div className="min-w-0 lg:pl-[248px]">
          <AppHeader owner={owner} />
          <AppPageTransition>
            <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pt-6 xl:px-8">
              <div className="mx-auto w-full max-w-[1640px]">{children}</div>
            </main>
          </AppPageTransition>
          <MobileNav items={items} />
          {!owner && <FloatingZhenya />}
        </div>
      </div>
    </FavoritesProvider>
  );
}
