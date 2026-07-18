"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  Building2,
  CalendarCheck2,
  ChevronDown,
  CircleUserRound,
  FileCheck2,
  Heart,
  Home,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Plus,
  ReceiptRussianRuble,
  Search,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AvatarImage } from "@/components/ui/avatar-image";
import { getRepository } from "@/lib/repositories";
import { tenantNavigation, ownerNavigation } from "./navigation";

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

export function AppHeader({ owner = false }: { owner?: boolean }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(2);
  const unreadNotifications = 3;

  useEffect(() => {
    let isMounted = true;
    getRepository()
      .getChatThreads()
      .then((threads) => {
        if (!isMounted) return;
        const count = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
        setUnreadMessages(count);
      })
      .catch((err) => console.error(err));
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const target = owner ? "/owner/properties" : "/app/housing";
    router.push(`${target}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navItems = owner ? ownerNavigation : tenantNavigation;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[76px] items-center bg-[#F4F4F0] px-4 sm:px-6">
        <div className="flex h-full w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandLogo className="[&_img]:h-auto [&_img]:w-[112px]" />
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden h-[46px] max-w-[580px] flex-1 items-center gap-3 rounded-full border border-[#E5E5E0] bg-white px-4 text-[#878881] shadow-sm transition-colors focus-within:border-[#B3DB00] sm:flex"
          >
            <Search className="size-[18px] stroke-[1.8] text-[#878881]" />
            <span className="sr-only">Поиск по платформе</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                owner
                  ? "Поиск по объектам и заявкам..."
                  : "Поиск по городам, районам, людям, объявлениям..."
              }
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111111] outline-none placeholder:text-[#878881]"
            />
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href={owner ? "/owner/properties/new" : "/app/group/create"}
              className="lime-button hidden h-[44px] items-center gap-2 rounded-full px-5 text-[12.5px] font-extrabold shadow-sm transition-transform hover:scale-[1.02] md:inline-flex"
            >
              <Plus className="size-4 stroke-[2.5]" />
              {owner ? "Добавить объект" : "Создать объявление"}
            </Link>

            <Link
              href={owner ? "/owner/messages" : "/app/messages"}
              aria-label={`Сообщения: ${unreadMessages} новых`}
              className="relative grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
            >
              <span className="sr-only">Сообщения</span>
              <svg className="size-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-[#B3DB00] text-[9px] font-black text-[#111111]">
                  {unreadMessages}
                </span>
              )}
            </Link>

            <Link
              href={owner ? "/owner/notifications" : "/app/notifications"}
              aria-label={`Уведомления: ${unreadNotifications} новых`}
              className="relative grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
            >
              <Bell className="size-[19px] stroke-[1.8]" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-[#B3DB00] text-[9px] font-black text-[#111111]">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <Link
              href={owner ? "/owner/profile" : "/app/profile"}
              className="flex items-center gap-2.5 rounded-full border border-[#E5E5E0] bg-white p-1 pr-3.5 shadow-sm transition-colors hover:bg-[#F4F4F0]"
            >
              <AvatarImage
                src="/demo/people/maria.jpg"
                name="Анна Смирнова"
                size={36}
                className="size-[36px]"
              />
              <ChevronDown className="size-4 text-[#777871]" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
              className="grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm hover:bg-[#F4F4F0] lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F4F4F0] p-6 lg:hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-4">
            <BrandLogo className="[&_img]:h-auto [&_img]:w-[120px]" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="grid size-10 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="mt-4 flex items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-4 py-2.5 shadow-sm">
            <Search className="size-4 text-[#878881]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по сайту..."
              className="w-full bg-transparent text-sm text-[#111111] outline-none"
            />
          </form>

          <nav className="mt-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 rounded-2xl p-3.5 text-sm font-bold text-[#111111] hover:bg-[#EBF7B6]"
                >
                  {Icon ? <Icon className="size-5 text-[#7B9E00]" /> : null}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#E5E5E0] space-y-3">
            <Link
              href={owner ? "/owner/properties/new" : "/app/group/create"}
              onClick={() => setMobileMenuOpen(false)}
              className="lime-button flex h-12 w-full items-center justify-center gap-2 rounded-full font-black text-sm"
            >
              <Plus className="size-4 stroke-[2.5]" />
              {owner ? "Добавить объект" : "Создать объявление"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
