import "server-only";

import {
  Pool,
  type PoolClient,
  type PoolConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";

const DEFAULT_POOL_SIZE = 10;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;
const DEFAULT_IDLE_TIMEOUT_MS = 30_000;
const DEFAULT_STATEMENT_TIMEOUT_MS = 15_000;

type GlobalWithDatabasePool = typeof globalThis & {
  __sosediDatabasePool?: Pool;
};

export type DatabaseHealth = {
  ok: boolean;
  latencyMs: number;
  error?: string;
};

function readPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function shouldUseSsl(connectionString: string): boolean {
  if (process.env.DATABASE_SSL === "true") return true;
  if (process.env.DATABASE_SSL === "false") return false;

  try {
    const hostname = new URL(connectionString).hostname;
    return hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1";
  } catch {
    return false;
  }
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database access");
  }

  const config: PoolConfig = {
    connectionString,
    max: readPositiveInteger(process.env.DATABASE_POOL_MAX, DEFAULT_POOL_SIZE),
    connectionTimeoutMillis: readPositiveInteger(
      process.env.DATABASE_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS,
    ),
    idleTimeoutMillis: readPositiveInteger(
      process.env.DATABASE_IDLE_TIMEOUT_MS,
      DEFAULT_IDLE_TIMEOUT_MS,
    ),
    statement_timeout: readPositiveInteger(
      process.env.DATABASE_STATEMENT_TIMEOUT_MS,
      DEFAULT_STATEMENT_TIMEOUT_MS,
    ),
    application_name: process.env.DATABASE_APPLICATION_NAME ?? "sosedi-web",
  };

  if (shouldUseSsl(connectionString)) {
    config.ssl = {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
    };
  }

  return new Pool(config);
}

export function getPool(): Pool {
  const globalWithPool = globalThis as GlobalWithDatabasePool;
  if (!globalWithPool.__sosediDatabasePool) {
    globalWithPool.__sosediDatabasePool = createPool();
  }

  return globalWithPool.__sosediDatabasePool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, [...values]);
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original error. A broken connection is discarded by pg.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = performance.now();

  try {
    await query("SELECT 1");
    return { ok: true, latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export type { PoolClient, QueryResult, QueryResultRow } from "pg";
