import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/app-shell";
import { ownerNavigation } from "@/components/app-shell/navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const isDummy =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-url");

  if (!isDummy) {
    const { data } = await (await createClient()).auth.getClaims();
    if (!data?.claims) redirect("/auth/login");
  }
  return <AppShell items={ownerNavigation} owner>{children}</AppShell>;
}