"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  CalendarCheck2,
  CircleUserRound,
  FileCheck2,
  Gift,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircle,
  ReceiptRussianRuble,
  Search,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AvatarImage } from "@/components/ui/avatar-image";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "./navigation";

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

function isCurrentPath(pathname: string, item: NavigationItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-[#E5E5E0] bg-white px-4 pb-4 pt-6 lg:flex">
      <BrandLogo className="mb-7 px-3 [&_img]:h-auto [&_img]:w-[124px]" />

      <nav
        aria-label="Основная навигация"
        className="soft-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
      >
        {items.map((item) => {
          const active = isCurrentPath(pathname, item);
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-[39px] items-center gap-3 rounded-[13px] px-3 text-[12.5px] font-semibold text-[#65665F] transition-colors duration-150",
                active
                  ? "bg-[hsl(var(--accent-soft))] font-bold text-[#111111]"
                  : "hover:bg-[#F5F5F1] hover:text-[#111111]",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] stroke-[1.75]",
                  active && "text-[#8FB000]",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="grid size-[19px] place-items-center rounded-full bg-[hsl(var(--accent))] text-[9px] font-extrabold text-[#111111]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[20px] bg-[hsl(var(--accent-soft))] p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-extrabold">Пригласите друга</p>
            <p className="mt-1 text-[10px] leading-4 text-[#696B61]">
              Получите 500 ₽ после его регистрации
            </p>
          </div>
          <Gift className="size-7 text-[#8FB000]" />
        </div>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#111111] px-3 text-[10px] font-bold text-white">
          Пригласить <ArrowRight className="size-3" />
        </button>
      </div>

      <Link
        href="/app/profile"
        className="mt-3 flex items-center gap-3 border-t border-[#E5E5E0] px-2 pb-1 pt-4 transition-colors"
      >
        <AvatarImage
          src="/demo/people/maria.jpg"
          name="Анна Смирнова"
          size={38}
          className="size-[38px]"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-bold">Анна Смирнова</span>
          <span className="block text-[9px] text-muted-foreground">
            Мой профиль
          </span>
        </span>
        <UserRound className="size-4 text-muted-foreground" />
      </Link>
    </aside>
  );
}
