import { NextResponse } from "next/server";
import { type ZodType } from "zod";
import { consumeRateLimit, getRequestIp } from "@/lib/auth/rate-limit";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

export class RequestValidationError extends Error {
  readonly fields: Record<string, string[]>;
  readonly status: 400 | 413;

  constructor(
    fields: Record<string, string[]> = {},
    message = "Некорректные данные",
    status: 400 | 413 = 400,
  ) {
    super(message);
    this.name = "RequestValidationError";
    this.fields = fields;
    this.status = status;
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const maximumBytes = 16 * 1_024;
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new RequestValidationError({}, "Запрос слишком большой", 413);
  }

  let input: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > maximumBytes) {
      throw new RequestValidationError({}, "Запрос слишком большой", 413);
    }
    input = JSON.parse(body) as unknown;
  } catch (error) {
    if (error instanceof RequestValidationError) throw error;
    throw new RequestValidationError({}, "Некорректный JSON");
  }

  const result = schema.safeParse(input);
  if (!result.success) {
    throw new RequestValidationError(
      result.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }
  return result.data;
}

export function jsonResponse<T>(body: T, init: ResponseInit = {}): NextResponse<T> {
  const headers = new Headers(init.headers);
  headers.set("cache-control", "no-store, max-age=0");
  headers.set("pragma", "no-cache");
  return NextResponse.json(body, { ...init, headers });
}

export function validationErrorResponse(error: RequestValidationError): NextResponse<ApiErrorBody> {
  return jsonResponse(
    {
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        fields: error.fields,
      },
    },
    { status: error.status },
  );
}

export async function enforceAuthRateLimit(
  request: Request,
  scope: string,
  keySuffix: string,
  limit: number,
  windowSeconds: number,
): Promise<NextResponse<ApiErrorBody> | null> {
  const result = await consumeRateLimit({
    scope,
    key: `${getRequestIp(request)}:${keySuffix}`,
    limit,
    windowSeconds,
  });
  if (result.allowed) return null;

  return jsonResponse(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Слишком много попыток. Попробуйте позже.",
      },
    },
    {
      status: 429,
      headers: {
        "retry-after": String(result.retryAfterSeconds),
        "x-ratelimit-remaining": String(result.remaining),
      },
    },
  );
}
