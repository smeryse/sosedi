const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!res.ok) {
    let errBody: { detail?: string; error?: string } = {};
    try {
      errBody = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      res.status,
      errBody.error || "UNKNOWN",
      errBody.detail || errBody.error || `HTTP ${res.status}`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>("POST", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>("PATCH", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>("PUT", path, body, options),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>("DELETE", path, undefined, options),
};

export { ApiError };
export type { ApiError as ApiErrorType };
