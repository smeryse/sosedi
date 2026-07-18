"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  Building2,
  CalendarCheck2,
  ChevronRight,
  CircleUserRound,
  FileCheck2,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircle,
  Moon,
  ReceiptRussianRuble,
  Search,
  Settings,
  Sun,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AvatarImage } from "@/components/ui/avatar-image";
import type { NavItem } from "./navigation";
import { tenantNavigation } from "./navigation";

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

export function AppSidebar({ items = tenantNavigation }: { items?: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[248px] flex-col border-r border-[#E5E5E0] bg-white lg:flex">
      {/* Brand Logo Header */}
      <div className="flex h-[76px] items-center px-6">
        <Link href="/" className="inline-block">
          <BrandLogo className="[&_img]:h-auto [&_img]:w-[130px]" />
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 soft-scrollbar">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              item.href === "/app" || item.href === "/owner"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex h-[44px] items-center justify-between rounded-[18px] px-3.5 text-[13px] font-bold transition-all ${
                  isActive
                    ? "bg-[#EBF7B6] text-[#111111]"
                    : "text-[#111111] hover:bg-[#F4F4F0]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {Icon ? (
                    <Icon
                      className={`size-[19px] stroke-[1.9] transition-colors ${
                        isActive ? "text-[#7B9E00]" : "text-[#111111]"
                      }`}
                    />
                  ) : null}
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1.5 text-[10px] font-black ${
                      isActive
                        ? "bg-[#7B9E00] text-white"
                        : "bg-[#B3DB00] text-[#111111]"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Promo & Theme Toggle & Profile (Exact match to 1.png) */}
      <div className="space-y-3 p-3.5 pt-2 border-t border-[#E5E5E0]/60">
        {/* Promo Card: Пригласите друга */}
        <div className="relative overflow-hidden rounded-[20px] bg-[#F3F9D2] p-4 shadow-sm">
          <p className="text-[12.5px] font-black text-[#111111]">Пригласите друга</p>
          <p className="mt-1 text-[10.5px] leading-4 text-[#6B6F66] font-medium max-w-[120px]">
            и получите 500 ₽ на баланс после его регистрации
          </p>
          <Link
            href="/app/profile"
            className="mt-3 inline-flex h-7 items-center rounded-full bg-[#111111] px-3.5 text-[10.5px] font-black text-white transition-transform hover:scale-[1.02]"
          >
            Пригласить
          </Link>
          <div className="absolute -bottom-1 -right-1 text-[38px] opacity-80 pointer-events-none select-none">
            🙌
          </div>
        </div>

        {/* Theme Toggle Pill Switch */}
        <div className="flex items-center justify-between rounded-full bg-[#F4F4F0] p-1 text-[11px] font-bold text-[#6B6F66]">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-[#111111] shadow-sm"
          >
            <Sun className="size-3.5 text-[#7B9E00]" />
            <span>Светлая</span>
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-[#6B6F66] hover:text-[#111111]"
          >
            <Moon className="size-3.5" />
            <span>Тёмная</span>
          </button>
        </div>

        {/* User Profile Footer Link */}
        <Link
          href="/app/profile"
          className="flex items-center justify-between rounded-[18px] p-2 transition-colors hover:bg-[#F4F4F0]"
        >
          <div className="flex items-center gap-2.5">
            <AvatarImage
              src="/demo/people/maria.jpg"
              name="Анна Смирнова"
              size={36}
              className="size-[36px]"
            />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black text-[#111111]">Анна</p>
              <p className="text-[10px] text-[#6B6F66]">Мой профиль</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-[#878881]" />
        </Link>
      </div>
    </aside>
  );
}
