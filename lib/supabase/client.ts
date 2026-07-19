import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

const FALLBACK_URL = "https://xyzxxxxxxxxxxxxxxxxx.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder";

function getValidConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url =
    envUrl && envUrl.startsWith("http") && envUrl.length > 12
      ? envUrl
      : FALLBACK_URL;

  const key = envKey && envKey.length > 20 ? envKey : FALLBACK_KEY;

  return { url, key };
}

export function createClient() {
  const { url, key } = getValidConfig();
  return createBrowserClient<Database>(url, key);
}