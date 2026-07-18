"use client";

import { useState, useRef, useEffect } from "react";
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
  Gamepad2,
  Heart,
  Home,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  Moon,
  ReceiptRussianRuble,
  Search,
  Settings,
  Sun,
  UsersRound,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import type { NavItem } from "./navigation";
import { tenantNavigation, ownerNavigation } from "./navigation";

const iconMap = {
  bell: Bell,
  bot: Bot,
  building: Building2,
  calendar: CalendarCheck2,
  user: CircleUserRound,
  file: FileCheck2,
  gamepad: Gamepad2,
  heart: Heart,
  home: Home,
  dashboard: LayoutDashboard,
  message: MessageCircle,
  wallet: ReceiptRussianRuble,
  search: Search,
  settings: Settings,
  users: UsersRound,
} as const;

export function FloatingNav({
  items = tenantNavigation,
  owner = false,
}: {
  items?: NavItem[];
  owner?: boolean;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  // Primary dock items
  const primaryHrefs = owner
    ? ["/owner", "/owner/properties", "/owner/applications", "/owner/messages"]
    : ["/app", "/app/roommates", "/app/housing", "/app/simulator", "/app/favorites", "/app/messages", "/app/assistant"];

  const primaryItems = items.filter((item) => primaryHrefs.includes(item.href));
  const extraItems = items.filter((item) => !primaryHrefs.includes(item.href));

  // Check if any extra item is active
  const isExtraActive = extraItems.some((item) =>
    item.href === "/app" || item.href === "/owner"
      ? pathname === item.href
      : pathname.startsWith(item.href)
  );

  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 transition-all duration-300"
      ref={popoverRef}
    >
      {/* Popover Card for 'Ещё' (More) Menu */}
      {moreOpen && (
        <div className="absolute bottom-full left-1/2 mb-3.5 w-[320px] -translate-x-1/2 overflow-hidden rounded-[28px] border border-white/60 bg-white/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-250 ease-out">
          <div className="flex items-center justify-between border-b border-[#E5E5E0]/70 pb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-md bg-[#B3DB00] text-[10px] font-black text-[#111111]">
                <Zap className="size-3 stroke-[2.5]" />
              </span>
              <span className="text-[12px] font-black text-[#111111] uppercase tracking-wider">
                Все сервисы
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="grid size-6 place-items-center rounded-full bg-[#F4F4F0] text-[#6B6F66] hover:bg-[#111111] hover:text-white transition-all duration-200 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 max-h-[300px] overflow-y-auto soft-scrollbar pr-1">
            {extraItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                item.href === "/app" || item.href === "/owner"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`group flex h-[44px] items-center justify-between rounded-[18px] px-3.5 text-[13px] font-extrabold transition-all duration-200 ${
                    isActive
                      ? "bg-[#EBF7B6] text-[#111111] shadow-sm"
                      : "text-[#222222] hover:bg-[#F4F4F0] hover:translate-x-1"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon ? (
                      <span
                        className={`grid size-7 place-items-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#7B9E00] text-white"
                            : "bg-[#F4F4F0] text-[#111111] group-hover:bg-[#EBF7B6]"
                        }`}
                      >
                        <Icon className="size-[15px] stroke-[2.2]" />
                      </span>
                    ) : null}
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span
                      className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-black ${
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
          </div>

          {/* Promo Card inside Popover */}
          {!owner && (
            <div className="mt-3.5 relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#F3F9D2] via-[#EAF6B0] to-[#DCF085] p-3.5 shadow-sm border border-[#B3DB00]/40">
              <div className="relative z-10">
                <p className="text-[12.5px] font-black text-[#111111]">Пригласите друга</p>
                <p className="mt-0.5 text-[10.5px] leading-3.5 text-[#4A4E44] font-semibold">
                  +500 ₽ на бонусный баланс
                </p>
                <Link
                  href="/app/profile"
                  onClick={() => setMoreOpen(false)}
                  className="mt-2.5 inline-flex h-7 items-center rounded-full bg-[#111111] px-3.5 text-[10.5px] font-black text-white shadow-sm hover:scale-105 transition-transform"
                >
                  Получить ссылку 🙌
                </Link>
              </div>
              <div className="absolute -bottom-2 -right-1 text-[42px] opacity-70 pointer-events-none select-none">
                🎁
              </div>
            </div>
          )}

          {/* Quick Profile Link */}
          <div className="mt-3 pt-2.5 border-t border-[#E5E5E0]/70">
            <Link
              href={owner ? "/owner/profile" : "/app/profile"}
              onClick={() => setMoreOpen(false)}
              className="flex items-center justify-between rounded-[20px] p-2 hover:bg-[#F4F4F0] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <AvatarImage
                    src="/demo/people/maria.jpg"
                    name="Анна Смирнова"
                    size={36}
                    className="size-9 ring-2 ring-[#B3DB00]/60"
                  />
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#7B9E00] ring-2 ring-white" />
                </div>
                <div>
                  <p className="text-[12.5px] font-black text-[#111111]">Анна Смирнова</p>
                  <p className="text-[10.5px] font-medium text-[#6B6F66]">Мой аккаунт</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-[#878881]" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Ultra-Modern Dock Navigation */}
      <nav
        aria-label="Основная навигация"
        className="relative flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.14),0_2px_10px_rgba(0,0,0,0.04)] backdrop-blur-3xl transition-all duration-300 ring-1 ring-black/5"
      >
        {primaryItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/app" || item.href === "/owner"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          const isAssistant = item.href === "/app/assistant";

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredTab(item.href)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`group relative flex h-11 items-center gap-2 rounded-full px-4 text-[12.5px] font-black transition-all duration-300 ease-out ${
                isActive
                  ? "bg-[#EBF7B6] text-[#111111] shadow-[0_4px_16px_rgba(179,219,0,0.35)] scale-[1.03]"
                  : isAssistant
                  ? "bg-gradient-to-r from-[#F3F9D2] via-[#E2F594] to-[#B3DB00] text-[#111111] shadow-[0_4px_20px_rgba(179,219,0,0.4)] hover:scale-[1.05]"
                  : "text-[#333333] hover:bg-[#F4F4F0] hover:scale-[1.03] hover:text-[#111111]"
              }`}
            >
              {/* Glowing Aura for Assistant */}
              {isAssistant && (
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#B3DB00] to-[#7B9E00] opacity-40 blur-sm animate-pulse -z-10" />
              )}

              {Icon ? (
                <Icon
                  className={`size-[19px] stroke-[2.2] transition-transform duration-300 group-hover:scale-110 ${
                    isActive
                      ? "text-[#6A8B00]"
                      : isAssistant
                      ? "text-[#111111]"
                      : "text-[#333333] group-hover:text-[#111111]"
                  }`}
                />
              ) : null}

              {/* Label */}
              <span className={`hidden sm:inline-block whitespace-nowrap ${isActive ? "inline-block" : ""}`}>
                {item.label}
              </span>

              {/* Badge */}
              {item.badge ? (
                <span
                  className={`grid h-4.5 min-w-[18px] place-items-center rounded-full px-1.5 text-[9.5px] font-black transition-transform duration-200 group-hover:scale-110 ${
                    isAssistant
                      ? "bg-[#111111] text-[#B3DB00]"
                      : isActive
                      ? "bg-[#7B9E00] text-white"
                      : "bg-[#B3DB00] text-[#111111]"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}

              {/* Tooltip on Hover */}
              {hoveredTab === item.href && !isActive && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#111111] px-2.5 py-1 text-[10.5px] font-bold text-white shadow-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rotate-45 bg-[#111111]" />
                </span>
              )}
            </Link>
          );
        })}

        {/* Separator Line */}
        <div className="h-6 w-px bg-[#E5E5E0]" />

        {/* 'Ещё' (More) Button */}
        {extraItems.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            onMouseEnter={() => setHoveredTab("more")}
            onMouseLeave={() => setHoveredTab(null)}
            className={`group relative flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-black transition-all duration-300 ease-out cursor-pointer ${
              moreOpen || isExtraActive
                ? "bg-[#EBF7B6] text-[#111111] shadow-sm scale-[1.03]"
                : "text-[#333333] hover:bg-[#F4F4F0] hover:scale-[1.03] hover:text-[#111111]"
            }`}
          >
            <LayoutGrid
              className={`size-[19px] stroke-[2.2] transition-transform duration-300 group-hover:rotate-12 ${
                moreOpen || isExtraActive ? "text-[#6A8B00]" : "text-[#333333] group-hover:text-[#111111]"
              }`}
            />
            <span className="hidden sm:inline-block">Ещё</span>
            {isExtraActive && (
              <span className="size-2 rounded-full bg-[#7B9E00] shadow-[0_0_8px_#7B9E00]" />
            )}

            {/* Tooltip for More */}
            {hoveredTab === "more" && !moreOpen && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#111111] px-2.5 py-1 text-[10.5px] font-bold text-white shadow-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                Все сервисы
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rotate-45 bg-[#111111]" />
              </span>
            )}
          </button>
        )}
      </nav>
    </div>
  );
}
