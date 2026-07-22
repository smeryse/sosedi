import { NvidiaRateLimitError } from "./nvidia-errors";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class NvidiaRateLimiter {
  private userLimits: Map<string, RateLimitRecord> = new Map();

  public checkLimit(key: string, limitPerWindow: number, windowMs: number = 60000): void {
    const now = Date.now();
    const record = this.userLimits.get(key);

    if (!record || now > record.resetAt) {
      this.userLimits.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (record.count >= limitPerWindow) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      throw new NvidiaRateLimitError(
        `Превышен лимит запросов AI. Попробуйте через ${retryAfter} сек.`,
        retryAfter
      );
    }

    record.count += 1;
  }
}

export const globalNvidiaRateLimiter = new NvidiaRateLimiter();
