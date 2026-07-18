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
  if (item.exact || item.href === "/app" || item.href === "/owner") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[#E5E5E0] bg-white px-4 pb-4 pt-6 lg:flex">
      <div className="mb-6 px-2">
        <BrandLogo className="[&_img]:h-auto [&_img]:w-[128px]" />
      </div>

      <nav
        aria-label="Основная навигация"
        className="soft-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1"
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
                "group flex min-h-[42px] items-center gap-3 rounded-[14px] px-3.5 text-[13px] font-semibold transition-colors duration-150",
                active
                  ? "bg-[#EBF7B6] font-bold text-[#111111]"
                  : "text-[#6B6F66] hover:bg-[#F4F4F0] hover:text-[#111111]",
              )}
            >
              <Icon
                className={cn(
                  "size-[19px] stroke-[1.8]",
                  active ? "text-[#7B9E00]" : "text-[#777871] group-hover:text-[#111111]",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="grid size-[20px] place-items-center rounded-full bg-[#B3DB00] text-[9px] font-black text-[#111111]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[20px] bg-[#F3F9D2] p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-extrabold text-[#111111]">Пригласите друга</p>
            <p className="mt-1 text-[10.5px] leading-4 text-[#686A62]">
              Получите 500 ₽ на баланс после его регистрации
            </p>
          </div>
          <Gift className="size-6 shrink-0 text-[#8FB000]" />
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#111111] px-3.5 text-[10.5px] font-extrabold text-white transition-opacity hover:opacity-90"
        >
          Пригласить <ArrowRight className="size-3" />
        </button>
      </div>

      <Link
        href="/app/profile"
        className="mt-3 flex items-center gap-3 border-t border-[#E5E5E0] px-2 pb-1 pt-4 transition-colors hover:opacity-80"
      >
        <AvatarImage
          src="/demo/people/maria.jpg"
          name="Анна Смирнова"
          size={38}
          className="size-[38px] ring-2 ring-[#EBF7B6]"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-extrabold text-[#111111]">
            Анна Смирнова
          </span>
          <span className="block text-[10px] text-[#6B6F66]">
            Мой профиль
          </span>
        </span>
        <UserRound className="size-4 text-[#878881]" />
      </Link>
    </aside>
  );
}
