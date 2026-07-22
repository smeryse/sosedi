import { createClient as createBrowserClient } from "@/lib/supabase/client";

// Transitional adapter for legacy Server Actions that still use the old
// Supabase-shaped API. Data access is being moved to FastAPI incrementally.
export async function createClient(): Promise<any> {
  return createBrowserClient() as any;
}
