import "server-only";

import { isDemoMode } from "@/lib/utils";
import { DemoRepository } from "./demo-repository";
import { PostgresRepository } from "./postgres-repository";
import type { Repository } from "./types";

let serverRepositoryInstance: Repository | null = null;

export function getRepository(): Repository {
  if (!serverRepositoryInstance) {
    serverRepositoryInstance = isDemoMode()
      ? new DemoRepository()
      : new PostgresRepository();
  }

  return serverRepositoryInstance;
}

export function resetRepository(): void {
  serverRepositoryInstance = null;
}
