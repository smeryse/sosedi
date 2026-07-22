export class AppError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code: string = "UNKNOWN_ERROR", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export function handleSupabaseError(error: unknown, fallbackMessage: string): never {
  console.error(`[Supabase Error] ${fallbackMessage}`, error);
  const errCode = (error as { code?: string })?.code;
  if (errCode) {
    throw new AppError(fallbackMessage, `DB_${errCode}`, error);
  }
  throw new AppError(fallbackMessage, "DB_UNKNOWN", error);
}

