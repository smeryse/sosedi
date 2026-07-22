"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createClientRepository } from "@/lib/repositories";
import type { ChatMessage } from "@/lib/repositories/types";

export function useRealtimeMessages(threadId: string, initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(initialMessages.length === 0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();
    const repo = createClientRepository();

    async function fetchInitialMessages() {
      if (initialMessages.length > 0) return;
      try {
        setLoading(true);
        const initial = await repo.getMessages(threadId);
        if (isMounted) {
          setMessages(initial);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err : new Error("Failed to load messages"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInitialMessages();

    if (threadId === "ai-assistant") return; // AI assistant doesn't use realtime

    const channel = supabase
      .channel(`realtime-messages-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${threadId}`,
        },
        async (payload: any) => {
          try {
            const freshMessages = await repo.getMessages(threadId);
            setMessages(freshMessages);
          } catch (e) {
            console.error("Failed to fetch fresh messages on insert", e);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${threadId}`,
        },
        async () => {
          try {
            const freshMessages = await repo.getMessages(threadId);
            setMessages(freshMessages);
          } catch (e) {
            console.error("Failed to fetch fresh messages on update", e);
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        const newState = (channel as any).presenceState();
        const typingIds = Object.values(newState)
          .flat()
          .filter((state: any) => state.isTyping)
          .map((state: any) => state.userId);
        // Only keep unique IDs
        setTypingUsers([...new Set(typingIds)]);
      })
      .subscribe(async (status: any) => {
        if (status === "SUBSCRIBED") {
          // Wait to track initial presence
          await (channel as any).track({ isTyping: false, userId: "user" }); // TODO: Replace "user" with actual ID
        }
      });

    channelRef.current = channel;

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [threadId, initialMessages.length]);

  const setTyping = async (isTyping: boolean) => {
    if (channelRef.current && threadId !== "ai-assistant") {
      await (channelRef.current as any).track({ isTyping, userId: "user" });
    }
  };

  const sendMessage = async (
    content: string,
    type: ChatMessage["type"] = "text",
    extraData?: any
  ) => {
    // Optimistic Update
    const tempId = crypto.randomUUID();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      senderId: "temp-user",
      senderName: "Вы",
      senderAvatar: "/demo/people/maria.jpg",
      content,
      timestamp: "Отправка...",
      type,
      ...extraData,
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const repo = createClientRepository();
      const savedMsg = await repo.sendMessage(threadId, content, type, { ...extraData, clientGeneratedId: tempId });
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? savedMsg : msg)));
      return savedMsg;
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      throw err;
    }
  };

  return { messages, loading, error, sendMessage, setMessages, typingUsers, setTyping };
}
