import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const ALGORITHM = "scrypt";
const VERSION = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const MAX_MEMORY = 64 * 1024 * 1024;
const FALLBACK_SALT = Buffer.alloc(SALT_LENGTH, 0x5a);

type PasswordHashParts = {
  cost: number;
  blockSize: number;
  parallelization: number;
  salt: Buffer;
  digest: Buffer;
};

function deriveKey(
  password: string,
  salt: Buffer,
  parameters: Pick<PasswordHashParts, "cost" | "blockSize" | "parallelization">,
): Promise<Buffer> {
  const pepper = process.env.AUTH_PASSWORD_PEPPER ?? "";

  return new Promise((resolve, reject) => {
    scrypt(
      `${password}${pepper}`,
      salt,
      KEY_LENGTH,
      {
        N: parameters.cost,
        r: parameters.blockSize,
        p: parameters.parallelization,
        maxmem: MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(derivedKey);
      },
    );
  });
}

function parsePasswordHash(value: string): PasswordHashParts | null {
  const [algorithm, version, cost, blockSize, parallelization, salt, digest, extra] =
    value.split("$");

  if (algorithm !== ALGORITHM || version !== String(VERSION) || extra !== undefined) {
    return null;
  }

  const parsedCost = Number.parseInt(cost, 10);
  const parsedBlockSize = Number.parseInt(blockSize, 10);
  const parsedParallelization = Number.parseInt(parallelization, 10);

  if (
    parsedCost !== COST ||
    parsedBlockSize !== BLOCK_SIZE ||
    parsedParallelization !== PARALLELIZATION
  ) {
    return null;
  }

  try {
    const parsedSalt = Buffer.from(salt, "base64url");
    const parsedDigest = Buffer.from(digest, "base64url");
    if (parsedSalt.length !== SALT_LENGTH || parsedDigest.length !== KEY_LENGTH) return null;

    return {
      cost: parsedCost,
      blockSize: parsedBlockSize,
      parallelization: parsedParallelization,
      salt: parsedSalt,
      digest: parsedDigest,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const digest = await deriveKey(password, salt, {
    cost: COST,
    blockSize: BLOCK_SIZE,
    parallelization: PARALLELIZATION,
  });

  return [
    ALGORITHM,
    VERSION,
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64url"),
    digest.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parsed = parsePasswordHash(storedHash);
  const parameters = parsed ?? {
    cost: COST,
    blockSize: BLOCK_SIZE,
    parallelization: PARALLELIZATION,
    salt: FALLBACK_SALT,
    digest: Buffer.alloc(KEY_LENGTH),
  };
  const candidate = await deriveKey(password, parameters.salt, parameters);

  return parsed !== null && timingSafeEqual(candidate, parameters.digest);
}

export async function createDummyPasswordHash(): Promise<string> {
  return hashPassword(randomBytes(32).toString("base64url"));
}
