"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";
import { createClientRepository } from "@/lib/repositories";
import type { ChatMessage, ChatThread } from "@/lib/repositories/types";
import { useRealtimeThreads } from "@/hooks/use-realtime-threads";

interface MessengerContainerProps {
  activeThreadId?: string;
  baseRoute?: string;
}

export function MessengerContainer({ activeThreadId, baseRoute = "/app/messages" }: MessengerContainerProps) {
  const router = useRouter();
  const { threads, loading: threadsLoading, setThreads } = useRealtimeThreads();
  const [selectedThreadId, setSelectedThreadId] = useState(activeThreadId || "maria");

  useEffect(() => {
    if (activeThreadId) {
      setSelectedThreadId(activeThreadId);
    }
  }, [activeThreadId]);

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    if (baseRoute) {
      router.push(`${baseRoute}/${id}`);
    }
  };

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  if (threadsLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] min-h-[550px] items-center justify-center rounded-[24px] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-xl">
        <div className="size-8 animate-spin rounded-full border-3 border-[#7B9E00] border-t-transparent" />
      </div>
    );
  }

  // Fallback if no threads exist yet, though realistically there should be at least one or an empty state UI.
  // But we let ChatWindow handle undefined thread gracefully or avoid rendering it.
  
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/75 bg-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl h-[calc(100vh-150px)] min-h-[600px] grid lg:grid-cols-[340px_1fr]">
      {/* Sidebar */}
      <div className={`h-full border-r border-[#E5E5E0]/60 ${activeThreadId ? "hidden lg:block" : "block"}`}>
        <ChatSidebar
          threads={threads}
          activeThreadId={selectedThreadId}
          onSelectThread={handleSelectThread}
          onThreadsUpdate={(updated) => setThreads(updated)}
        />
      </div>

      {/* Main Chat Window */}
      <div className={`h-full ${!activeThreadId ? "hidden lg:block" : "block"}`}>
        {activeThread ? (
          <ChatWindow
            thread={activeThread}
            initialMessages={[]}
            onBackToList={() => {
              setSelectedThreadId("");
              router.push(baseRoute);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#878881]">
            Выберите диалог
          </div>
        )}
      </div>
    </div>
  );
}
