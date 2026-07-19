import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

const FALLBACK_SUPABASE_URL = "https://xyzxxxxxxxxxxxxxxxxx.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder";

function getValidConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url =
    envUrl && envUrl.trim().length > 10 && envUrl.startsWith("http")
      ? envUrl.trim()
      : FALLBACK_SUPABASE_URL;

  const key = envKey && envKey.trim().length > 20 ? envKey.trim() : FALLBACK_SUPABASE_KEY;

  return { url, key };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getValidConfig();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Ignore setAll errors when invoked from Server Components
        }
      },
    },
  });
}