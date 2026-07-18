"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";
import { DemoRepository } from "@/lib/repositories/demo-repository";
import type { ChatMessage, ChatThread } from "@/lib/repositories/types";

interface MessengerContainerProps {
  activeThreadId?: string;
  baseRoute?: string;
}

export function MessengerContainer({ activeThreadId, baseRoute = "/app/messages" }: MessengerContainerProps) {
  const router = useRouter();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState(activeThreadId || "maria");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeThreadId) {
      setSelectedThreadId(activeThreadId);
    }
  }, [activeThreadId]);

  useEffect(() => {
    async function load() {
      const repo = new DemoRepository();
      const loadedThreads = await repo.getChatThreads();
      const loadedMessages = await repo.getMessages(selectedThreadId);
      setThreads(loadedThreads);
      setMessages(loadedMessages);
      setLoading(false);
    }
    load();
  }, [selectedThreadId]);

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    if (baseRoute) {
      router.push(`${baseRoute}/${id}`);
    }
  };

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  if (loading || !activeThread) {
    return (
      <div className="flex h-[calc(100vh-140px)] min-h-[550px] items-center justify-center rounded-[24px] border border-[#E5E5E0] bg-white">
        <div className="size-6 animate-spin rounded-full border-2 border-[#7B9E00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white shadow-sm h-[calc(100vh-150px)] min-h-[580px] grid lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <div className={`h-full ${activeThreadId ? "hidden lg:block" : "block"}`}>
        <ChatSidebar
          threads={threads}
          activeThreadId={selectedThreadId}
          onSelectThread={handleSelectThread}
          onThreadsUpdate={(updated) => setThreads(updated)}
        />
      </div>

      {/* Main Chat Window */}
      <div className={`h-full ${!activeThreadId ? "hidden lg:block" : "block"}`}>
        <ChatWindow
          thread={activeThread}
          initialMessages={messages}
          onBackToList={() => {
            setSelectedThreadId("");
            router.push(baseRoute);
          }}
        />
      </div>
    </div>
  );
}
