"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Building2,
  MessageCircle,
  Pin,
  Search,
  User,
  Users,
  PinOff,
} from "lucide-react";
import { DemoRepository } from "@/lib/repositories/demo-repository";
import type { ChatThread } from "@/lib/repositories/types";

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId?: string;
  onSelectThread?: (threadId: string) => void;
  onThreadsUpdate?: (threads: ChatThread[]) => void;
}

export function ChatSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onThreadsUpdate,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "roommate" | "group" | "owner" | "ai_assistant">("all");

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchesFilter = filter === "all" || t.type === filter;
      const needle = search.trim().toLocaleLowerCase("ru");
      const matchesSearch =
        !needle ||
        `${t.name} ${t.sublabel || ""} ${t.lastMessage}`
          .toLocaleLowerCase("ru")
          .includes(needle);
      return matchesFilter && matchesSearch;
    });
  }, [threads, filter, search]);

  const handleTogglePin = async (e: React.MouseEvent, threadId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const repo = new DemoRepository();
    const updated = await repo.togglePinThread(threadId);
    onThreadsUpdate?.(updated);
  };

  return (
    <div className="flex h-full flex-col bg-white/40 backdrop-blur-md">
      {/* Header & Search */}
      <div className="p-4 border-b border-[#E5E5E0]/60 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-black tracking-tight text-[#111111]">
            Чаты
          </h2>
          <span className="rounded-full bg-[#EBF7B6] px-2.5 py-0.5 text-[10px] font-black text-[#7B9E00]">
            {threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0)} сообщений
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex h-10 items-center rounded-full border border-[#E5E5E0] bg-white/70 px-3.5 transition-all focus-within:border-[#B3DB00] focus-within:bg-white shadow-sm">
          <Search className="mr-2 size-4 text-[#878881]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск собеседника..."
            className="w-full bg-transparent text-[11.5px] text-[#111111] font-bold outline-none placeholder:text-[#878881]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 soft-scrollbar">
          {[
            { id: "all", label: "Все" },
            { id: "roommate", label: "Соседи", icon: User },
            { id: "group", label: "Группы", icon: Users },
            { id: "owner", label: "Собственники", icon: Building2 },
            { id: "ai_assistant", label: "ИИ", icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as "all" | "roommate" | "group" | "owner" | "ai_assistant")}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#111111] text-white shadow-sm"
                    : "bg-white/80 text-[#6B6F66] border border-[#E5E5E0]/60 hover:bg-[#EBF7B6] hover:text-[#111111]"
                }`}
              >
                {Icon ? <Icon className="size-3" /> : null}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E0]/40 p-2 space-y-1 soft-scrollbar">
        {filteredThreads.map((thread) => {
          const isActive = thread.id === activeThreadId;

          return (
            <Link
              key={thread.id}
              href={`/app/messages/${thread.id}`}
              onClick={() => onSelectThread?.(thread.id)}
              className={`group flex items-center gap-3 p-3 rounded-[20px] transition-all border ${
                isActive
                  ? "bg-[#EBF7B6]/55 border-[#B3DB00]/60 shadow-sm"
                  : "bg-white/40 border-transparent hover:bg-white/80 hover:border-[#E5E5E0]/50"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {thread.avatars && thread.avatars.length > 0 ? (
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {thread.avatars.slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative size-8 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm"
                      >
                        <Image src={img} alt="Avatar" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : thread.avatar ? (
                  <div className="relative size-10.5 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
                    <Image
                      src={thread.avatar}
                      alt={thread.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid size-10.5 place-items-center rounded-full bg-[#EBF7B6] text-xs font-black text-[#111111] border-2 border-white shadow-sm">
                    {thread.name.slice(0, 1)}
                  </div>
                )}

                {thread.isOnline ? (
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#7B9E00]" />
                ) : null}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="truncate text-[12.5px] font-black text-[#111111] flex items-center gap-1.5">
                    {thread.name}
                    {thread.isPinned && (
                      <Pin className="size-3 text-[#7B9E00] fill-[#7B9E00] rotate-45" />
                    )}
                  </h4>
                  <span className="shrink-0 text-[9.5px] font-bold text-[#878881]">
                    {thread.lastMessageTime}
                  </span>
                </div>

                {thread.sublabel ? (
                  <p className="text-[10px] font-bold text-[#7B9E00] truncate mt-0.5">
                    {thread.sublabel}
                  </p>
                ) : null}

                <p className="mt-0.5 truncate text-[11px] font-semibold text-[#6B6F66]">
                  {thread.lastMessage}
                </p>
              </div>

              {/* Actions & Unread */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {thread.unreadCount ? (
                  <span className="grid h-4.5 min-w-[18px] place-items-center rounded-full bg-[#7B9E00] px-1 text-[9px] font-black text-white shadow-sm">
                    {thread.unreadCount}
                  </span>
                ) : (
                  <MessageCircle className="size-3.5 text-[#878881] opacity-0 group-hover:opacity-100" />
                )}

                <button
                  type="button"
                  onClick={(e) => handleTogglePin(e, thread.id)}
                  title={thread.isPinned ? "Открепить чат" : "Закрепить чат"}
                  className="opacity-0 group-hover:opacity-100 text-[#878881] hover:text-[#7B9E00] transition-opacity cursor-pointer"
                >
                  {thread.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                </button>
              </div>
            </Link>
          );
        })}

        {!filteredThreads.length && (
          <div className="p-8 text-center text-xs font-bold text-[#6B6F66]">
            Диалоги не найдены
          </div>
        )}
      </div>
    </div>
  );
}
