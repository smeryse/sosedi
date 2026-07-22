import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { tenantNavigation } from "@/components/app-shell/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/utils";

export default async function TenantLayout({ children }: { children: ReactNode }) {
  if (isDemoMode()) {
    return <AppShell items={tenantNavigation}>{children}</AppShell>;
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!user.roles.some((role) => role === "tenant" || role === "admin")) {
    redirect(user.roles.includes("landlord") ? "/owner" : "/auth/login");
  }
  if (!user.onboardingCompleted) redirect("/onboarding?role=tenant");

  return <AppShell items={tenantNavigation}>{children}</AppShell>;
}
