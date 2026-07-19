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
  Gamepad2,
  Gift,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
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

export function AppSidebar({ items = tenantNavigation }: { items?: NavItem[] }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { theme, setTheme } = useTheme();

  return (
    <motion.aside
      initial={false}
      className="sidebar-enter fixed bottom-0 left-0 top-0 z-40 hidden w-[248px] flex-col border-r bg-background lg:flex"
    >
      <div className="flex h-[72px] items-center border-b px-6">
        <BrandLogo className="[&_img]:h-auto [&_img]:w-[126px]" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 soft-scrollbar">
        <nav className="space-y-0.5">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon];
            const isActive =
              item.href === "/app" || item.href === "/owner"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <motion.div
                key={item.href}
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.04 + index * 0.025 }}
                whileHover={reduceMotion ? undefined : { x: 2 }}
              >
                <Link
                  href={item.href}
                  className={`group relative flex h-[40px] items-center justify-between overflow-hidden rounded-[14px] px-3 text-[12.5px] font-bold transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-accent/20 dark:bg-accent-soft/50"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <div className="relative flex items-center gap-3">
                    {Icon ? <Icon className={`size-[18px] stroke-[1.8] ${isActive ? "text-accent dark:text-accent" : "text-muted-foreground"}`} /> : null}
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className={`relative grid h-[18px] min-w-[18px] place-items-center rounded-full px-1.5 text-[9px] font-black ${isActive ? "bg-foreground text-background" : "bg-accent text-accent-foreground dark:text-background"}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2.5 border-t p-3 pt-2.5">
        <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} className="sidebar-promo relative overflow-hidden rounded-[18px] bg-accent/10 p-3.5 dark:bg-accent-soft/30">
          <div className="absolute -right-7 -top-8 size-24 rounded-full border border-background/70 bg-background/30" />
          <div className="absolute -bottom-8 right-6 size-20 rounded-full bg-accent/20 blur-xl dark:bg-accent/10" />
          <p className="text-[12.5px] font-black text-foreground">Пригласите друга</p>
          <p className="mt-1 max-w-[140px] text-[10px] font-medium leading-3.5 text-muted-foreground">
            Получите 500 ₽ на баланс после его регистрации
          </p>
          <Link
            href="/app/profile"
            className="pressable relative mt-2.5 inline-flex h-7 items-center rounded-full bg-foreground px-3.5 text-[10px] font-black text-background"
          >
            Пригласить
          </Link>
          <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-background/75 text-accent shadow-sm dark:bg-surface/80"><Gift className="size-4" /></span>
        </motion.div>

        <div className="flex items-center justify-between rounded-full bg-secondary p-1 text-[11px] font-bold text-muted-foreground">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors ${
              theme === "light" ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
            }`}
          >
            <Sun className={`size-3.5 ${theme === "light" ? "text-accent" : ""}`} />
            <span>Светлая</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors ${
              theme === "dark" ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
            }`}
          >
            <Moon className={`size-3.5 ${theme === "dark" ? "text-accent" : ""}`} />
            <span>Тёмная</span>
          </button>
        </div>

        <Link
          href="/app/profile"
          className="flex items-center justify-between rounded-[18px] p-2 transition-colors hover:bg-secondary"
        >
          <div className="flex items-center gap-2.5">
            <AvatarImage
              src="/demo/people/maria.jpg"
              name="Анна Смирнова"
              size={36}
              className="size-[36px]"
            />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black text-foreground">Анна</p>
              <p className="text-[10px] text-muted-foreground">Мой профиль</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </motion.aside>
  );
}
