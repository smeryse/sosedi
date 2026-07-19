"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  displayName: string;
  avatarPath: string;
  jobTitle?: string;
  role?: string;
}

interface SessionContextType {
  session: { user: User } | null;
  user: User | null;
  profile: UserProfile;
  loading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultAnnaProfile: UserProfile = {
  id: "anna-default-id",
  displayName: "Анна",
  avatarPath: "/demo/people/anna.svg",
  jobTitle: "Product Designer",
  role: "tenant",
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [profile, setProfile] = useState<UserProfile>(defaultAnnaProfile);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_path, job_title")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        setProfile({
          id: data.id,
          displayName: data.display_name || "Анна",
          avatarPath: data.avatar_path || "/demo/people/anna.svg",
          jobTitle: data.job_title || "Product Designer",
          role: "tenant",
        });
      }
    } catch {
      // Keep fallback
    }
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession({ user: data.session.user });
        await loadProfile(data.session.user.id);
      } else {
        setSession(null);
        setProfile(defaultAnnaProfile);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [supabase.auth, loadProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      setSession(null);
      setProfile(defaultAnnaProfile);
    }
  }, [supabase.auth]);

  useEffect(() => {
    refreshSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession({ user: session.user });
        loadProfile(session.user.id);
      } else {
        setSession(null);
        setProfile(defaultAnnaProfile);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth, refreshSession, loadProfile]);

  return (
    <SessionContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        refreshSession,
        signOut,
      }}
    >
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