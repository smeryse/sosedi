import { query, type QueryResultRow } from "@/lib/db";

type ConsentRow = QueryResultRow & {
  ai_consent: boolean | null;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_RATE_LIMIT_KEYS = 10_000;
const rateLimits = new Map<string, RateLimitEntry>();
let rateLimitChecks = 0;

const PII_PATTERNS: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  {
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: "[email скрыт]",
  },
  {
    pattern:
      /(?<!\d)(?:\+7|8)[\s()-]*\d{3}[\s()-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}(?!\d)/g,
    replacement: "[телефон скрыт]",
  },
  {
    pattern: /\b\d{3}-\d{3}-\d{3}[ -]?\d{2}\b/g,
    replacement: "[СНИЛС скрыт]",
  },
  {
    pattern: /(?:паспорт(?:а|ные данные)?\s*[:№]?\s*)\d{4}\s*\d{6}(?!\d)/gi,
    replacement: "[паспорт скрыт]",
  },
  {
    pattern: /(?:ИНН\s*[:№]?\s*)\d{10,12}(?!\d)/gi,
    replacement: "[ИНН скрыт]",
  },
  {
    pattern: /(?<!\d)(?:\d[ -]?){15,18}\d(?!\d)/g,
    replacement: "[номер карты скрыт]",
  },
];

export function scrubPII(value: string): string {
  return PII_PATTERNS.reduce(
    (result, { pattern, replacement }) => result.replace(pattern, replacement),
    value,
  );
}

export function sanitizePromptContent(value: string): string {
  return scrubPII(value)
    .replace(/ignore (all )?previous instructions/gi, "[инъекция отклонена]")
    .replace(/override instructions/gi, "[инъекция отклонена]")
    .replace(/system prompt/gi, "системная инструкция")
    .replace(/show (me )?your (secret|key|api|system)/gi, "[запрос отклонён]");
}

function cleanupRateLimits(now: number): void {
  for (const [key, entry] of rateLimits) {
    if (entry.resetAt <= now) rateLimits.delete(key);
  }

  while (rateLimits.size > MAX_RATE_LIMIT_KEYS) {
    const oldestKey = rateLimits.keys().next().value;
    if (typeof oldestKey !== "string") break;
    rateLimits.delete(oldestKey);
  }
}

export function consumeAIRateLimit(userId: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  rateLimitChecks += 1;
  if (rateLimitChecks % 100 === 0 || rateLimits.size > MAX_RATE_LIMIT_KEYS) {
    cleanupRateLimits(now);
  }

  const current = rateLimits.get(userId);
  const entry =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
      : current;
  entry.count += 1;
  rateLimits.set(userId, entry);

  return {
    allowed: entry.count <= RATE_LIMIT_MAX_REQUESTS,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
  };
}

export async function hasAIConsent(userId: string): Promise<boolean> {
  const result = await query<ConsentRow>(
    `SELECT ai_consent
     FROM user_settings
     WHERE user_id = $1
     LIMIT 1`,
    [userId],
  );

  return result.rows[0]?.ai_consent === true;
}

export function resetAIRateLimitsForTests(): void {
  rateLimits.clear();
  rateLimitChecks = 0;
}
