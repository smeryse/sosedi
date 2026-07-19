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

export function handleSupabaseError(error: any, fallbackMessage: string): never {
  console.error(`[Supabase Error] ${fallbackMessage}`, error);
  if (error?.code) {
    throw new AppError(fallbackMessage, `DB_${error.code}`, error);
  }
  throw new AppError(fallbackMessage, "DB_UNKNOWN", error);
}
