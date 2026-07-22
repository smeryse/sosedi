export class NvidiaError extends Error {
  public readonly statusCode?: number;
  public readonly code: string;

  constructor(message: string, code: string = "NVIDIA_ERROR", statusCode?: number) {
    // Ensure no API keys or secret tokens are present in error message
    const sanitizedMsg = message.replace(/nvapi-[A-Za-z0-9_-]+/g, "[REDACTED_API_KEY]");
    super(sanitizedMsg);
    this.name = "NvidiaError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NvidiaApiError extends NvidiaError {
  constructor(message: string, statusCode?: number) {
    super(message, "NVIDIA_API_ERROR", statusCode);
    this.name = "NvidiaApiError";
  }
}

export class NvidiaRateLimitError extends NvidiaError {
  public readonly retryAfterSeconds?: number;

  constructor(message: string = "NVIDIA API Rate Limit Exceeded", retryAfterSeconds?: number) {
    super(message, "NVIDIA_RATE_LIMIT", 429);
    this.name = "NvidiaRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class NvidiaAuthError extends NvidiaError {
  constructor(message: string = "NVIDIA API Authentication Failed") {
    super(message, "NVIDIA_AUTH_ERROR", 401);
    this.name = "NvidiaAuthError";
  }
}

export class NvidiaTimeoutError extends NvidiaError {
  constructor(message: string = "NVIDIA API Request Timed Out") {
    super(message, "NVIDIA_TIMEOUT", 408);
    this.name = "NvidiaTimeoutError";
  }
}

export class NvidiaCircuitBreakerError extends NvidiaError {
  constructor(message: string = "NVIDIA Circuit Breaker is OPEN") {
    super(message, "NVIDIA_CIRCUIT_BREAKER_OPEN", 503);
    this.name = "NvidiaCircuitBreakerError";
  }
}
