"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftRight, Bell, ChevronDown, MessageCircle, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarImage } from "@/components/ui/avatar-image";
import { createClientRepository } from "@/lib/repositories";

import { useSession } from "@/lib/auth/session-context";

const routeSearchHints: Array<[string, string]> = [
  ["/app/messages", "Поиск по чатам и сообщениям"],
  ["/app/roommates", "Поиск по людям, районам и интересам"],
  ["/app/housing", "Поиск по квартирам, адресам и районам"],
  ["/app/applications", "Поиск по заявкам"],
  ["/owner", "Поиск по объектам, заявкам и людям"],
];

export function AppHeader({ owner = false }: { owner?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useSession();
  const [query, setQuery] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(2);
  const placeholder = routeSearchHints.find(([route]) => pathname.startsWith(route))?.[1]
    ?? "Поиск по городам, районам, людям, объявлениям";

  useEffect(() => {
    let mounted = true;
    createClientRepository()
      .getChatThreads()
      .then((threads) => {
        if (mounted) {
          setUnreadMessages(threads.reduce((total, thread) => total + (thread.unreadCount || 0), 0));
        }
      })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    const target = owner ? "/owner/properties" : pathname.startsWith("/app/roommates") ? "/app/roommates" : "/app/housing";
    router.push(`${target}?search=${encodeURIComponent(query.trim())}`);
  };

  const nextMode = owner
    ? { href: "/app", label: "Перейти к поиску жилья", role: "tenant" }
    : { href: "/owner", label: "Перейти в режим владельца", role: "landlord" };

  const rememberNextMode = () => {
    try {
      window.localStorage.setItem("sosedi-role", nextMode.role);
    } catch {
      // Navigation remains available when local storage is blocked.
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/88 px-4 py-3 backdrop-blur-2xl sm:px-6 xl:px-8">
      <div className="mx-auto flex h-12 max-w-[1640px] items-center gap-3">
        <Link href={owner ? "/owner" : "/app"} className="mr-auto font-heading text-xl font-bold tracking-[-0.04em] lg:hidden">
          соседи<span className="text-accent">.</span>
        </Link>

        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 sm:block lg:max-w-[620px]">
          <label className="group flex h-12 items-center gap-3 rounded-full border bg-surface/85 px-5 shadow-[0_6px_24px_rgba(0,0,0,0.025)] transition duration-300 focus-within:border-accent/60 focus-within:bg-surface focus-within:shadow-[0_10px_30px_rgba(115,140,10,0.08)] dark:shadow-none">
            <Search className="size-[18px] shrink-0 text-muted-foreground transition group-focus-within:text-accent" />
            <span className="sr-only">Поиск</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground" />
            <kbd className="hidden rounded-md bg-secondary px-2 py-1 text-[9px] font-semibold text-muted-foreground xl:block">⌘ K</kbd>
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <Link
            href={nextMode.href}
            aria-label={nextMode.label}
            title={nextMode.label}
            onClick={rememberNextMode}
            className="inline-flex h-11 items-center gap-2 rounded-full border bg-surface/85 px-3 text-[11px] font-bold transition duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-md xl:px-4"
          >
            <ArrowLeftRight className="size-[17px] stroke-[1.8]" aria-hidden="true" />
            <span className="xl:hidden">{owner ? "Ищу" : "Сдаю"}</span>
            <span className="hidden xl:inline">{owner ? "Ищу жильё" : "Сдаю жильё"}</span>
          </Link>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link href={owner ? "/owner/properties/new" : "/app/group/create"} className="hidden h-11 items-center gap-2 rounded-full bg-accent px-5 text-[12px] font-bold text-accent-foreground shadow-[0_8px_25px_rgba(166,204,0,0.18)] transition hover:brightness-110 md:inline-flex">
              <Plus className="size-4" /> {owner ? "Разместить объявление" : "Создать"}
            </Link>
          </motion.div>

          <Link href={owner ? "/owner/messages" : "/app/messages"} aria-label={`Сообщения: ${unreadMessages} новых`} className="relative grid size-11 place-items-center rounded-full border bg-surface/85 transition duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-md">
            <MessageCircle className="size-[19px] stroke-[1.8]" />
            {unreadMessages > 0 ? <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-accent text-[9px] font-black text-accent-foreground">{unreadMessages}</span> : null}
          </Link>
          <Link href={owner ? "/owner/applications" : "/app/notifications"} aria-label={owner ? "Новые заявки: 3" : "Уведомления: 3 новых"} className="relative hidden size-11 place-items-center rounded-full border bg-surface/85 transition duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-md sm:grid">
            <Bell className="size-[19px] stroke-[1.8]" />
            <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-accent text-[9px] font-black text-accent-foreground">3</span>
          </Link>
          <Link href={owner ? "/owner/profile" : "/app/profile"} className="flex h-11 items-center gap-2 rounded-full border bg-surface/85 p-1.5 pr-3 transition duration-200 hover:bg-surface hover:shadow-md">
            <AvatarImage src={profile.avatarPath} name={profile.displayName} size={32} className="size-8" />
            <span className="hidden text-[12px] font-bold xl:inline">{profile.displayName}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </header>
  );
}
