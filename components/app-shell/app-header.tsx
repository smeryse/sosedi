"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  Building2,
  CalendarCheck2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  FileCheck2,
  Heart,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  MessageCircle,
  Plus,
  ReceiptRussianRuble,
  Search,
  Settings,
  UsersRound,
  X,
  Gamepad2,
  Sparkles,
  Zap,
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

export function AppHeader({ owner = false }: { owner?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(2);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);
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

  // Close popover on click outside or escape key
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const target = owner ? "/owner/properties" : "/app/housing";
    router.push(`${target}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navItems = owner ? ownerNavigation : tenantNavigation;

  // Primary navigation links in the header
  const primaryHrefs = owner
    ? ["/owner", "/owner/properties", "/owner/applications"]
    : ["/app", "/app/roommates", "/app/housing", "/app/simulator", "/app/favorites"];

  const primaryNavItems = navItems.filter((item) => primaryHrefs.includes(item.href));
  const extraNavItems = navItems.filter((item) => !primaryHrefs.includes(item.href));

  const isExtraActive = extraNavItems.some((item) =>
    item.href === "/app" || item.href === "/owner"
      ? pathname === item.href
      : pathname.startsWith(item.href)
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[76px] items-center bg-[#F4F4F0]/80 backdrop-blur-2xl px-4 sm:px-6 border-b border-[#E5E5E0]/60 transition-all">
        <div className="flex h-full w-full items-center gap-4">
          
          {/* Left: Brand Logo Container (flex-1 to align left) */}
          <div className="flex flex-1 justify-start items-center gap-3 shrink-0">
            <BrandLogo className="[&_img]:h-auto [&_img]:w-[124px]" />
          </div>

          {/* Middle: Integrated Navigation Dock (Desktop Only, centered) */}
          <div className="hidden lg:flex justify-center items-center shrink-0">
            <nav
              aria-label="Основная навигация"
              className="flex items-center gap-1 rounded-full border border-white/80 bg-white/60 p-1 shadow-sm ring-1 ring-black/5 relative"
              ref={popoverRef}
            >
              {primaryNavItems.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive =
                  item.href === "/app" || item.href === "/owner"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHoveredTab(item.href)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`group relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-black transition-all duration-200 ${
                      isActive
                        ? "bg-[#EBF7B6] text-[#111111] shadow-sm scale-[1.01]"
                        : "text-[#4A4D45] hover:bg-[#F4F4F0]/80 hover:text-[#111111]"
                    }`}
                  >
                    {Icon ? (
                      <Icon
                        className={`size-[16px] stroke-[2.2] transition-transform duration-200 group-hover:scale-105 ${
                          isActive ? "text-[#6A8B00]" : "text-[#4A4D45] group-hover:text-[#111111]"
                        }`}
                      />
                    ) : null}

                    {/* Label is responsive: visible on xl+, or if active on lg+ */}
                    <span className={`hidden xl:inline-block whitespace-nowrap ${isActive ? "lg:inline-block" : ""}`}>
                      {item.label}
                    </span>

                    {item.badge ? (
                      <span
                        className={`grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[8.5px] font-black ${
                          isActive
                            ? "bg-[#7B9E00] text-white"
                            : "bg-[#B3DB00] text-[#111111]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}

                    {/* Tooltip on Hover */}
                    {hoveredTab === item.href && !isActive && (
                      <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#111111] px-2 py-0.5 text-[9.5px] font-bold text-white shadow-lg animate-in fade-in duration-150 pointer-events-none">
                        {item.label}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1.5 rotate-45 bg-[#111111]" />
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Separator Line */}
              {extraNavItems.length > 0 && <div className="h-4 w-px bg-[#E5E5E0]" />}

              {/* 'Ещё' (More) Dropdown Menu */}
              {extraNavItems.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMoreOpen(!moreOpen)}
                    onMouseEnter={() => setHoveredTab("more")}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`group flex h-9 items-center gap-1 rounded-full px-3 text-[12px] font-black transition-all duration-200 cursor-pointer ${
                      moreOpen || isExtraActive
                        ? "bg-[#EBF7B6] text-[#111111] shadow-sm"
                        : "text-[#4A4D45] hover:bg-[#F4F4F0]/80 hover:text-[#111111]"
                    }`}
                  >
                    <LayoutGrid
                      className={`size-[16px] stroke-[2.2] ${
                        moreOpen || isExtraActive ? "text-[#6A8B00]" : "text-[#4A4D45] group-hover:text-[#111111]"
                      }`}
                    />
                    <span>Ещё</span>
                    {isExtraActive && (
                      <span className="size-1.5 rounded-full bg-[#7B9E00] shadow-[0_0_6px_#7B9E00]" />
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {moreOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[280px] overflow-hidden rounded-[22px] border border-white/60 bg-white/95 p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-0.5 max-h-[260px] overflow-y-auto soft-scrollbar pr-1">
                        {extraNavItems.map((item) => {
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
                              onClick={() => setMoreOpen(false)}
                              className={`group/item flex h-9 items-center justify-between rounded-[14px] px-2.5 text-[12px] font-black transition-all duration-150 ${
                                isActive
                                  ? "bg-[#EBF7B6] text-[#111111]"
                                  : isAssistant
                                  ? "bg-[#F3F9D2] text-[#111111] hover:bg-[#E2F594]"
                                  : "text-[#222222] hover:bg-[#F4F4F0] hover:translate-x-0.5"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {Icon ? (
                                  <Icon
                                    className={`size-[15px] stroke-[2.2] ${
                                      isActive
                                        ? "text-[#7B9E00]"
                                        : isAssistant
                                        ? "text-[#6A8B00]"
                                        : "text-[#4A4D45] group-hover/item:text-[#111111]"
                                    }`}
                                  />
                                ) : null}
                                <span>{item.label}</span>
                              </div>

                              {item.badge ? (
                                <span
                                  className={`grid h-4.5 min-w-[16px] place-items-center rounded-full px-1 text-[8.5px] font-black ${
                                    isAssistant
                                      ? "bg-[#7B9E00] text-white"
                                      : isActive
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
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* Right side: Search bar (shifted right) + Actions (flex-1 to align right) */}
          <div className="flex flex-1 justify-end items-center gap-2.5 sm:gap-3">
            
            {/* Search Bar - Shifted Right */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex h-[38px] w-[180px] lg:w-[220px] focus-within:w-[260px] items-center gap-2.5 rounded-full border border-[#E5E5E0] bg-white px-3 text-[#878881] shadow-sm transition-all focus-within:border-[#B3DB00] focus-within:ring-2 focus-within:ring-[#B3DB00]/20 duration-300"
            >
              <Search className="size-[15px] stroke-[2.2] text-[#878881]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#111111] outline-none placeholder:text-[#878881]"
              />
              <kbd className="pointer-events-none hidden lg:inline-flex h-4.5 select-none items-center gap-0.5 rounded bg-[#F4F4F0] px-1 font-mono text-[9px] font-bold text-[#6B6F66] border border-[#E5E5E0]">
                ⌘K
              </kbd>
            </form>

            <Link
              href={owner ? "/owner/properties/new" : "/app/group/create"}
              className="lime-button hidden h-[38px] items-center gap-1.5 rounded-full px-4 text-[12px] font-black shadow-sm transition-transform hover:scale-[1.02] lg:inline-flex"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              {owner ? "Добавить" : "Создать"}
            </Link>

            {/* Messages */}
            <Link
              href={owner ? "/owner/messages" : "/app/messages"}
              aria-label={`Сообщения: ${unreadMessages} новых`}
              className="relative grid size-9.5 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
            >
              <span className="sr-only">Сообщения</span>
              <svg className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-[16px] place-items-center rounded-full bg-[#B3DB00] text-[8.5px] font-black text-[#111111]">
                  {unreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link
              href={owner ? "/owner/notifications" : "/app/notifications"}
              aria-label={`Уведомления: ${unreadNotifications} новых`}
              className="relative grid size-9.5 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
            >
              <Bell className="size-[17px] stroke-[2]" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-[16px] place-items-center rounded-full bg-[#B3DB00] text-[8.5px] font-black text-[#111111]">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link
              href={owner ? "/owner/profile" : "/app/profile"}
              className="flex items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white p-0.5 pr-2.5 shadow-sm transition-colors hover:bg-[#F4F4F0]"
            >
              <AvatarImage
                src="/demo/people/maria.jpg"
                name="Анна Смирнова"
                size={30}
                className="size-[30px]"
              />
              <ChevronDown className="size-3 text-[#777871]" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
              className="grid size-9.5 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm hover:bg-[#F4F4F0] lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
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
