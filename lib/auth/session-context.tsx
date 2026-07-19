"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface SessionContextType {
  session: { user: User } | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ? { user: data.session.user } : null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    refreshSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ? { user: session.user } : null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth, refreshSession]);

  return (
    <SessionContext.Provider value={{ session, loading, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}