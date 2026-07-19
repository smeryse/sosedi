/**
 * Observability Stack - Sentry + Pino + OpenTelemetry
 * 
 * Single entry point for all logging, metrics, and error tracking.
 * Works in both Server Components and Server Actions.
 */

import * as Sentry from "@sentry/nextjs";
import pino from "pino";
import { v4 as uuidv4 } from "uuid";

// ============================================================
// CONFIGURATION
// ============================================================

const isProduction = process.env.NODE_ENV === "production";
const isServer = typeof window === "undefined";

// Sentry DSN - set in environment variables
const SENTRY_DSN = process.env.SENTRY_DSN;

// Pino log level
const LOG_LEVEL = process.env.LOG_LEVEL || (isProduction ? "info" : "debug");

// Service name for tracing
const SERVICE_NAME = "sosedi";

// ============================================================
// SENTRY INITIALIZATION
// ============================================================

if (isServer && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 1.0,
    debug: !isProduction,
    beforeSend(event) {
      if (event.request?.url?.includes("/api/health")) return null;
      if (event.exception?.values?.[0]?.value?.includes("JWT")) return null;
      return event;
    },
    initialScope: {
      tags: { service: SERVICE_NAME },
    },
  });
}

// ============================================================
// PINO LOGGER
// ============================================================

const pinoLogger = pino({
  level: LOG_LEVEL,
  transport: !isProduction
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
      }
    : undefined,
  base: { service: SERVICE_NAME, environment: process.env.NODE_ENV },
  redact: {
    paths: [
      "*.password", "*.token", "*.secret", "*.apiKey", "*.authorization", "*.cookie",
      "req.headers.authorization", "req.headers.cookie", "response.headers.set-cookie"
    ],
    censor: "[REDACTED]",
  },
});

// ============================================================
// REQUEST CONTEXT HELPERS
// ============================================================

interface RequestContext {
  requestId: string;
  userId?: string;
  userRole?: string;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
}

function getRequestContext(): RequestContext {
  const requestId = uuidv4();
  return { requestId };
}

function enrichLogContext(
  context: Record<string, unknown>,
  requestContext: RequestContext
): Record<string, unknown> {
  return { ...context, ...requestContext, timestamp: new Date().toISOString() };
}

// ============================================================
// MAIN LOGGER EXPORTS
// ============================================================

export const logger = {
  trace: (msg: string, context?: Record<string, unknown>) => {
    pinoLogger.trace(enrichLogContext(context || {}, getRequestContext()), msg);
  },
  debug: (msg: string, context?: Record<string, unknown>) => {
    pinoLogger.debug(enrichLogContext(context || {}, getRequestContext()), msg);
  },
  info: (msg: string, context?: Record<string, unknown>) => {
    pinoLogger.info(enrichLogContext(context || {}, getRequestContext()), msg);
  },
  warn: (msg: string, context?: Record<string, unknown>) => {
    pinoLogger.warn(enrichLogContext(context || {}, getRequestContext()), msg);
  },
  error: (msg: string, context?: Record<string, unknown>) => {
    pinoLogger.error(enrichLogContext(context || {}, getRequestContext()), msg);
  },
  fatal: (msg: string, context?: Record<string, unknown>) => {
    pinoLogger.fatal(enrichLogContext(context || {}, getRequestContext()), msg);
  },

  child: (bindings: Record<string, unknown>) => {
    const childLogger = pinoLogger.child(bindings);
    return {
      trace: (msg: string, context?: Record<string, unknown>) => childLogger.trace(enrichLogContext(context || {}, getRequestContext()), msg),
      debug: (msg: string, context?: Record<string, unknown>) => childLogger.debug(enrichLogContext(context || {}, getRequestContext()), msg),
      info: (msg: string, context?: Record<string, unknown>) => childLogger.info(enrichLogContext(context || {}, getRequestContext()), msg),
      warn: (msg: string, context?: Record<string, unknown>) => childLogger.warn(enrichLogContext(context || {}, getRequestContext()), msg),
      error: (msg: string, context?: Record<string, unknown>) => childLogger.error(enrichLogContext(context || {}, getRequestContext()), msg),
      fatal: (msg: string, context?: Record<string, unknown>) => childLogger.fatal(enrichLogContext(context || {}, getRequestContext()), msg),
      child: (moreBindings: Record<string, unknown>) => childLogger.child(moreBindings),
    };
  },

  time: (label: string) => {
    const start = process.hrtime.bigint();
    return {
      end: (context?: Record<string, unknown>) => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        logger.debug(`${label} completed in ${durationMs.toFixed(2)}ms`, context);
        return durationMs;
      },
    };
  },
};

// ============================================================
// SENTRY ERROR TRACKING
// ============================================================

export const sentry = {
  captureException: (error: Error, context?: Record<string, unknown>) => {
    if (isServer && SENTRY_DSN) {
      const requestContext = getRequestContext();
      Sentry.withScope((scope) => {
        if (context) scope.setExtras(context);
        if (requestContext.requestId) scope.setTag("requestId", requestContext.requestId);
        scope.setTag("service", SERVICE_NAME);
        Sentry.captureException(error);
      });
    }
    logger.error(error.message, { error: error.stack, ...context });
  },

  captureMessage: (message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, unknown>) => {
    if (isServer && SENTRY_DSN) {
      const requestContext = getRequestContext();
      Sentry.withScope((scope) => {
        if (context) scope.setExtras(context);
        if (requestContext.requestId) scope.setTag("requestId", requestContext.requestId);
        scope.setLevel(level);
        Sentry.captureMessage(message);
      });
    }
    logger.info(message, context);
  },

  setUser: (user: { id: string; email?: string; username?: string; role?: string }) => {
    if (isServer && SENTRY_DSN) Sentry.setUser(user);
  },

  addBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
    if (isServer && SENTRY_DSN) Sentry.addBreadcrumb(breadcrumb);
  },

  startTransaction: (name: string, op: string) => {
    if (isServer && SENTRY_DSN) return Sentry.startInactiveSpan({ name, op });
    return null;
  },
};

// ============================================================
// METRICS HELPERS
// ============================================================

export const metrics = {
  increment: (name: string, tags?: Record<string, string>, value = 1) => {
    logger.debug(`metric.increment`, { metric: name, value, tags });
  },
  timing: (name: string, value: number, tags?: Record<string, string>) => {
    logger.debug(`metric.timing`, { metric: name, value, tags });
  },
  gauge: (name: string, value: number, tags?: Record<string, string>) => {
    logger.debug(`metric.gauge`, { metric: name, value, tags });
  },
};

// ============================================================
// MIDDLEWARE INTEGRATION
// ============================================================

export function withObservability<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T,
  options?: { name?: string; trackDuration?: boolean }
): T {
  const name = options?.name || handler.name || "anonymous";
  const trackDuration = options?.trackDuration ?? true;

  return (async (...args: unknown[]) => {
    const requestContext = getRequestContext();
    const transaction = sentry.startTransaction(name, "serverless.function");
    const timer = logger.time(name);

    try {
      logger.info(`Starting ${name}`, { requestId: requestContext.requestId });
      const result = await handler(...args);
      logger.info(`Completed ${name}`, { requestId: requestContext.requestId });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      sentry.captureException(err, { handler: name, args: args.map(String) });
      throw error;
    } finally {
      if (trackDuration) timer.end({ handler: name });
      transaction?.end();
    }
  }) as T;
}

// ============================================================
// EXPORTS
// ============================================================

export { pinoLogger as pino };
export type { RequestContext };
