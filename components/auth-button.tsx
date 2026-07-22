"use client";

import { useSession } from "@/lib/auth/session-context";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./sign-up-form";
import { Button } from "./ui/button";

export function AuthButton() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-24 animate-pulse bg-gray-200 rounded" />
        <div className="h-8 w-24 animate-pulse bg-gray-200 rounded" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <LoginForm />
        <SignUpForm />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Hey, {session.user.email}</span>
      <Button variant="outline" size="sm" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}

async function signOut() {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (res.ok) {
    window.location.href = "/";
  }
}
