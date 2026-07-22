import { NvidiaCircuitBreakerError } from "./nvidia-errors";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class NvidiaCircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private lastStateChange: number = Date.now();
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(failureThreshold = 5, resetTimeoutMs = 30000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  public checkState(): void {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.lastStateChange > this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        this.lastStateChange = now;
      } else {
        throw new NvidiaCircuitBreakerError();
      }
    }
  }

  public onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
      this.failureCount = 0;
      this.lastStateChange = Date.now();
    } else if (this.state === "CLOSED") {
      this.failureCount = 0;
    }
  }

  public onFailure(statusCode?: number): void {
    // Only count server errors or rate limits for circuit breaker, ignore 400 bad requests
    if (statusCode && (statusCode === 429 || statusCode >= 500)) {
      this.failureCount += 1;
      if (this.failureCount >= this.failureThreshold) {
        this.state = "OPEN";
        this.lastStateChange = Date.now();
      }
    }
  }

  public getState(): CircuitState {
    return this.state;
  }

  public reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastStateChange = Date.now();
  }
}

export const globalNvidiaCircuitBreaker = new NvidiaCircuitBreaker();
