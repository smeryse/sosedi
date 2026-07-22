import { getNvidiaConfig } from "../../config/nvidia-config";
import { globalNvidiaCircuitBreaker } from "./nvidia-circuit-breaker";
import {
  NvidiaError,
  NvidiaApiError,
  NvidiaAuthError,
  NvidiaRateLimitError,
  NvidiaTimeoutError,
} from "./nvidia-errors";

export interface NvidiaClientOptions {
  timeoutMs?: number;
  maxRetries?: number;
}

export class NvidiaClient {
  private readonly config = getNvidiaConfig();

  public async post<T>(
    endpointUrl: string,
    payload: Record<string, unknown>,
    options?: NvidiaClientOptions
  ): Promise<T> {
    globalNvidiaCircuitBreaker.checkState();

    if (!this.config.apiKey) {
      throw new NvidiaAuthError("NVIDIA_API_KEY не сконфигурирован в окружении сервера.");
    }

    const timeoutMs = options?.timeoutMs ?? this.config.requestTimeoutMs;
    const maxRetries = options?.maxRetries ?? this.config.maxRetries;
    const requestId = `nv-req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      attempt += 1;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            "X-Request-ID": requestId,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          globalNvidiaCircuitBreaker.onSuccess();
          const data = (await response.json()) as T;
          return data;
        }

        const statusCode = response.status;
        let errorText = "";
        try {
          errorText = await response.text();
        } catch {
          errorText = response.statusText;
        }

        const sanitizedError = errorText.replace(/nvapi-[A-Za-z0-9_-]+/g, "[REDACTED_KEY]");

        if (statusCode === 401 || statusCode === 403) {
          const authError = new NvidiaAuthError(`Ошибка авторизации NVIDIA (${statusCode}): ${sanitizedError}`);
          globalNvidiaCircuitBreaker.onFailure(statusCode);
          throw authError;
        }

        if (statusCode === 429) {
          const retryHeader = response.headers.get("Retry-After");
          const retrySeconds = retryHeader ? parseInt(retryHeader, 10) : 2;
          const rateLimitErr = new NvidiaRateLimitError(
            `Превышен лимит NVIDIA API (429): ${sanitizedError}`,
            retrySeconds
          );

          if (attempt <= maxRetries) {
            const backoffMs = retrySeconds * 1000 + Math.random() * 500;
            await new Promise((res) => setTimeout(res, backoffMs));
            continue;
          }

          globalNvidiaCircuitBreaker.onFailure(statusCode);
          throw rateLimitErr;
        }

        // Retryable server errors: 502, 503, 504
        if ([502, 503, 504].includes(statusCode) && attempt <= maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 500 + Math.random() * 300;
          await new Promise((res) => setTimeout(res, backoffMs));
          continue;
        }

        // Non-retryable client error or max retries exceeded
        const apiError = new NvidiaApiError(`NVIDIA API Error (${statusCode}): ${sanitizedError}`, statusCode);
        globalNvidiaCircuitBreaker.onFailure(statusCode);
        throw apiError;
      } catch (err: any) {
        clearTimeout(timer);

        if (err.name === "AbortError") {
          lastError = new NvidiaTimeoutError(`Запрос к NVIDIA API превысил таймаут ${timeoutMs}ms.`);
        } else if (err instanceof NvidiaError) {
          throw err;
        } else {
          lastError = err instanceof Error ? err : new Error(String(err));
        }

        if (attempt <= maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 400 + Math.random() * 200;
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    }

    globalNvidiaCircuitBreaker.onFailure(500);
    throw lastError || new NvidiaApiError("Неизвестная ошибка запроса к NVIDIA API.");
  }
}

export const globalNvidiaClient = new NvidiaClient();
