"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type BrowserUser = {
  id: string;
  email: string;
  displayName: string;
  avatarPath: string | null;
  roles: string[];
  onboardingCompleted: boolean;
};

export interface UserProfile {
  id: string;
  displayName: string;
  avatarPath: string;
  jobTitle?: string;
  role?: string;
}

interface SessionContextType {
  session: { user: BrowserUser } | null;
  user: BrowserUser | null;
  profile: UserProfile;
  loading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const emptyProfile: UserProfile = {
  id: "",
  displayName: "Пользователь",
  avatarPath: "/demo/people/anna.jpg",
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: BrowserUser } | null>(null);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok) {
        setSession(null);
        setProfile(emptyProfile);
        return;
      }
      const body = await response.json() as { user?: BrowserUser };
      const user = body.user;
      if (!user) {
        setSession(null);
        setProfile(emptyProfile);
        return;
      }
      setSession({ user });
      setProfile({
        id: user.id,
        displayName: user.displayName,
        avatarPath: user.avatarPath || "/demo/people/anna.jpg",
        role: user.roles.includes("landlord") ? "landlord" : "tenant",
      });
    } catch {
      setSession(null);
      setProfile(emptyProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setSession(null);
    setProfile(emptyProfile);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  return (
    <SessionContext.Provider value={{ session, user: session?.user ?? null, profile, loading, refreshSession, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}
