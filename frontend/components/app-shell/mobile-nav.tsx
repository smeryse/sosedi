"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  Building2,
  CalendarCheck2,
  CircleUserRound,
  FileCheck2,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircle,
  ReceiptRussianRuble,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "./navigation";

const iconMap = {
  bell: Bell,
  bot: Bot,
  building: Building2,
  calendar: CalendarCheck2,
  user: CircleUserRound,
  file: FileCheck2,
  heart: Heart,
  home: Home,
  dashboard: LayoutDashboard,
  message: MessageCircle,
  wallet: ReceiptRussianRuble,
  search: Search,
  settings: Settings,
  users: UsersRound,
} as const;

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const mobileItems = items.filter((item) => item.mobile).slice(0, 5);

  return (
    <nav
      aria-label="Мобильная навигация"
      className="fixed inset-x-3 bottom-3 z-50 grid h-16 grid-cols-5 rounded-[22px] border bg-surface/95 px-1 shadow-[0_16px_48px_rgba(20,24,14,.18)] backdrop-blur lg:hidden"
    >
      {mobileItems.map((item) => {
        const active =
          item.href === "/app" || item.href === "/owner"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const Icon = iconMap[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-1 rounded-[18px] text-[9px] font-bold text-muted-foreground",
              active && "text-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full",
                active && "bg-[hsl(var(--accent))]",
              )}
            >
              <Icon className="size-[17px]" />
            </span>
            <span className="max-w-full truncate px-0.5">
              {item.href === "/app/housing"
                ? "Жильё"
                : item.href === "/app/roommates"
                  ? "Соседи"
                  : item.href === "/owner/properties"
                    ? "Объекты"
                    : item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
