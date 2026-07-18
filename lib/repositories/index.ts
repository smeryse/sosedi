import { hasEnvVars } from "@/lib/utils";
import { DemoRepository } from "./demo-repository";
import { SupabaseRepository } from "./supabase-repository";
import type { Repository } from "./types";

export function getRepository(): Repository {
  return hasEnvVars ? new SupabaseRepository() : new DemoRepository();
}

export { DemoRepository } from "./demo-repository";
export type * from "./types";
