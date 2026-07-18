import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/app-shell";
import { tenantNavigation } from "@/components/app-shell/navigation";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TenantLayout({ children }: { children: ReactNode }) {
  if (hasEnvVars) {
    const { data } = await (await createClient()).auth.getClaims();
    if (!data?.claims) redirect("/auth/login");
  }
  return <AppShell items={tenantNavigation}>{children}</AppShell>;
}
