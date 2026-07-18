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
    <div className="flex h-full flex-col border-r border-[#E5E5E0] bg-white">
      {/* Header & Search */}
      <div className="p-4 border-b border-[#E5E5E0] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-[#111111]">
            Сообщения
          </h2>
          <span className="rounded-full bg-[#EBF7B6] px-2.5 py-0.5 text-[11px] font-extrabold text-[#111111]">
            {threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0)} новых
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex h-10 items-center rounded-full border border-[#E5E5E0] bg-[#F4F4F0] px-3 transition-all focus-within:border-[#111111] focus-within:bg-white">
          <Search className="mr-2 size-4 text-[#878881]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск собеседника или жилья..."
            className="w-full bg-transparent text-xs text-[#111111] outline-none placeholder:text-[#878881]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
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
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                  isActive
                    ? "bg-[#111111] text-white"
                    : "bg-[#F4F4F0] text-[#6B6F66] hover:bg-[#E5E5E0] hover:text-[#111111]"
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
      <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E0]/60">
        {filteredThreads.map((thread) => {
          const isActive = thread.id === activeThreadId;

          return (
            <Link
              key={thread.id}
              href={`/app/messages/${thread.id}`}
              onClick={() => onSelectThread?.(thread.id)}
              className={`group flex items-center gap-3 p-3.5 transition-all ${
                isActive
                  ? "bg-[#EBF7B6]/40 border-l-4 border-l-[#7B9E00]"
                  : "hover:bg-[#F9F9F6]"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {thread.avatars && thread.avatars.length > 0 ? (
                  <div className="flex -space-x-2 overflow-hidden">
                    {thread.avatars.slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative size-8 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                      >
                        <Image src={img} alt="Avatar" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : thread.avatar ? (
                  <div className="relative size-11 overflow-hidden rounded-full border border-[#E5E5E0] bg-gray-100">
                    <Image
                      src={thread.avatar}
                      alt={thread.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid size-11 place-items-center rounded-full bg-[#EBF7B6] text-xs font-black text-[#111111]">
                    {thread.name.slice(0, 1)}
                  </div>
                )}

                {thread.isOnline ? (
                  <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#7B9E00]" />
                ) : null}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="truncate text-xs font-extrabold text-[#111111] flex items-center gap-1">
                    {thread.name}
                    {thread.isPinned && (
                      <Pin className="size-3 text-[#7B9E00] fill-[#7B9E00]" />
                    )}
                  </h4>
                  <span className="shrink-0 text-[10px] text-[#878881]">
                    {thread.lastMessageTime}
                  </span>
                </div>

                {thread.sublabel ? (
                  <p className="text-[10px] font-semibold text-[#7B9E00] truncate mt-0.5">
                    {thread.sublabel}
                  </p>
                ) : null}

                <p className="mt-1 truncate text-[11px] text-[#6B6F66]">
                  {thread.lastMessage}
                </p>
              </div>

              {/* Unread badge & Pin Action */}
              <div className="flex flex-col items-end gap-1">
                {thread.unreadCount ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#7B9E00] text-[10px] font-black text-white">
                    {thread.unreadCount}
                  </span>
                ) : (
                  <MessageCircle className="size-3.5 text-[#878881] opacity-0 group-hover:opacity-100" />
                )}

                <button
                  type="button"
                  onClick={(e) => handleTogglePin(e, thread.id)}
                  title={thread.isPinned ? "Открепить чат" : "Закрепить чат"}
                  className="opacity-0 group-hover:opacity-100 text-[#878881] hover:text-[#7B9E00] transition-opacity"
                >
                  <Pin className="size-3" />
                </button>
              </div>
            </Link>
          );
        })}

        {!filteredThreads.length && (
          <div className="p-8 text-center text-xs text-[#6B6F66]">
            Диалоги не найдены
          </div>
        )}
      </div>
    </div>
  );
}
