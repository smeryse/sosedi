import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { ownerNavigation } from "@/components/app-shell/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/utils";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  if (isDemoMode()) {
    return <AppShell items={ownerNavigation} owner>{children}</AppShell>;
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!user.roles.some((role) => role === "landlord" || role === "admin")) {
    redirect(user.roles.includes("tenant") ? "/app" : "/auth/login");
  }
  if (!user.onboardingCompleted) redirect("/onboarding?role=landlord");

  return <AppShell items={ownerNavigation} owner>{children}</AppShell>;
}
