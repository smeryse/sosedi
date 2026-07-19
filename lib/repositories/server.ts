import "server-only";

import { isDemoMode } from "@/lib/utils";
import { DemoRepository } from "./demo-repository";
import { SupabaseRepository } from "./supabase-repository";
import type { Repository } from "./types";

let serverRepositoryInstance: Repository | null = null;

export function getRepository(): Repository {
  if (!serverRepositoryInstance) {
    serverRepositoryInstance = isDemoMode()
      ? new DemoRepository()
      : new SupabaseRepository();
  }

  return serverRepositoryInstance;
}

export function resetRepository(): void {
  serverRepositoryInstance = null;
}
