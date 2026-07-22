"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createClientRepository } from "@/lib/repositories";
import type { ChatThread } from "@/lib/repositories/types";

export function useRealtimeThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialThreads() {
      try {
        setLoading(true);
        const repo = createClientRepository();
        const initial = await repo.getChatThreads();
        if (isMounted) {
          setThreads(initial);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err : new Error("Failed to load threads"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const supabase = createClient();
    const repo = createClientRepository();

    fetchInitialThreads();

    const channel = supabase
      .channel("realtime-threads")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async () => {
          try {
            const freshThreads = await repo.getChatThreads();
            setThreads(freshThreads);
          } catch (e) {
            console.error("Failed to fetch fresh threads", e);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_members",
        },
        async () => {
          try {
            const freshThreads = await repo.getChatThreads();
            setThreads(freshThreads);
          } catch (e) {
            console.error("Failed to fetch fresh threads", e);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return { threads, loading, error, setThreads };
}
