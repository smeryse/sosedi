"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Heart, Home, MessageCircle, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Главная", href: "/app", icon: Home },
  { label: "Жильё", href: "/app/housing", icon: Building2 },
  { label: "Соседи", href: "/app/roommates", icon: UsersRound },
  { label: "Избранное", href: "/app/favorites", icon: Heart },
  { label: "Сообщения", href: "/app/messages", icon: MessageCircle },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Мобильная навигация"
      className="fixed inset-x-3 bottom-3 z-50 grid h-16 grid-cols-5 rounded-[22px] border bg-surface/95 px-1 shadow-[0_16px_48px_rgba(20,24,14,.18)] backdrop-blur lg:hidden"
    >
      {items.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-[18px] text-[9px] font-bold text-muted-foreground",
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
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
