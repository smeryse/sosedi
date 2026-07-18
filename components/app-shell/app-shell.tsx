import type { ReactNode } from "react";
import { Suspense } from "react";
import type { NavigationItem } from "./navigation";
import { AppHeader } from "./app-header";
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
      <div className="min-h-screen bg-[#F4F4F0] text-[#111111]">
        <div className="min-w-0">
          <AppHeader owner={owner} />
          <main className="px-4 pb-10 pt-3 sm:px-6 lg:pb-10 lg:pt-3">
            <div className="mx-auto w-full max-w-[1640px]">{children}</div>
          </main>
        </div>
      </div>
    </FavoritesProvider>
  );
}
