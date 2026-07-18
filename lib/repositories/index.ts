import { hasEnvVars } from "@/lib/utils";
import { DemoRepository } from "./demo-repository";
import { SupabaseRepository } from "./supabase-repository";
import type { Repository } from "./types";

export function getRepository(): Repository {
  const isDummy =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project-url.supabase.co" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-url");
  return hasEnvVars && !isDummy ? new SupabaseRepository() : new DemoRepository();
}

// Client-side Supabase client - only created once
let cachedBrowserClient: any = null;

function createBrowserClient() {
  if (typeof window === "undefined") return null;
  if (cachedBrowserClient) return cachedBrowserClient;
  
  const { createClient } = require("@/lib/supabase/client");
  cachedBrowserClient = createClient();
  return cachedBrowserClient;
}

// Get Supabase client - uses browser client everywhere except explicit server components
export async function getSupabaseClient() {
  // During SSR in client components, use browser client
  // Only use server client in actual Server Components/Actions
  if (typeof window !== "undefined") {
    return createBrowserClient();
  }
  
  // On server, check if we're in a client component context
  // by checking if we're running in the browser bundle
  // Use dynamic import to avoid bundling server code in client
  return createBrowserClient();
}

export { DemoRepository } from "./demo-repository";
export type * from "./types";