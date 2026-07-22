import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { Client, type ClientConfig, type QueryResultRow } from "pg";

const MIGRATION_LOCK_ID = 724_302_191;
const MIGRATION_FILE_PATTERN = /^\d{4}_[a-z0-9_]+\.sql$/;

type LockRow = QueryResultRow & { acquired: boolean };
type AppliedMigrationRow = QueryResultRow & { checksum: string };

function loadEnvironmentFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key) || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function loadEnvironment(): void {
  loadEnvironmentFile(resolve(process.cwd(), ".env.local"));
  loadEnvironmentFile(resolve(process.cwd(), ".env"));
}

function createClientConfig(connectionString: string): ClientConfig {
  const sslEnabled =
    process.env.DATABASE_SSL === "true" ||
    (process.env.DATABASE_SSL !== "false" &&
      !connectionString.includes("localhost") &&
      !connectionString.includes("127.0.0.1"));

  return {
    connectionString,
    application_name: "sosedi-migrations",
    connectionTimeoutMillis: 10_000,
    ssl: sslEnabled
      ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" }
      : undefined,
  };
}

function checksum(contents: string): string {
  return createHash("sha256").update(contents, "utf8").digest("hex");
}

async function migrate(): Promise<void> {
  loadEnvironment();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const migrationsDirectory = resolve(process.cwd(), "db", "migrations");
  if (!existsSync(migrationsDirectory)) {
    throw new Error(`Migration directory does not exist: ${migrationsDirectory}`);
  }

  const migrationFiles = readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const invalidFile = migrationFiles.find((file) => !MIGRATION_FILE_PATTERN.test(file));
  if (invalidFile) throw new Error(`Invalid migration filename: ${invalidFile}`);
  if (migrationFiles.length === 0) throw new Error("No migration files found");

  const client = new Client(createClientConfig(connectionString));
  let lockAcquired = false;
  await client.connect();

  try {
    const lockResult = await client.query<LockRow>(
      "SELECT pg_try_advisory_lock($1) AS acquired",
      [MIGRATION_LOCK_ID],
    );
    lockAcquired = lockResult.rows[0]?.acquired === true;
    if (!lockAcquired) {
      throw new Error("Another migration process is already running");
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        execution_ms INTEGER NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT schema_migrations_checksum_format
          CHECK (checksum ~ '^[0-9a-f]{64}$'),
        CONSTRAINT schema_migrations_execution_nonnegative
          CHECK (execution_ms >= 0)
      )
    `);

    for (const file of migrationFiles) {
      const sql = readFileSync(resolve(migrationsDirectory, file), "utf8");
      const migrationChecksum = checksum(sql);
      const appliedResult = await client.query<AppliedMigrationRow>(
        "SELECT checksum FROM schema_migrations WHERE version = $1",
        [file],
      );
      const applied = appliedResult.rows[0];

      if (applied) {
        if (applied.checksum.trim() !== migrationChecksum) {
          throw new Error(`Checksum mismatch for already applied migration: ${file}`);
        }
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const startedAt = performance.now();
      await client.query("BEGIN");
      try {
        await client.query("SET LOCAL lock_timeout = '10s'");
        await client.query("SET LOCAL statement_timeout = '10min'");
        await client.query(sql);
        const executionMs = Math.max(0, Math.round(performance.now() - startedAt));
        await client.query(
          `INSERT INTO schema_migrations (version, checksum, execution_ms)
           VALUES ($1, $2, $3)`,
          [file, migrationChecksum, executionMs],
        );
        await client.query("COMMIT");
        console.log(`Applied ${file} (${executionMs} ms)`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    if (lockAcquired) {
      await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]);
    }
    await client.end();
  }
}

migrate().catch((error: unknown) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
