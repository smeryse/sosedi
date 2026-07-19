import { AppError } from "@/lib/domain/errors";

export abstract class BaseRepository {
  protected handleError(error: unknown, fallbackMessage: string, code: string = "DB_ERROR"): never {
    console.error(`[Repository Error] ${fallbackMessage}`, error);
    
    if (error instanceof AppError) {
      throw error;
    }

    if (error && typeof error === "object" && "code" in error) {
      const pgCode = (error as { code: string }).code;
      throw new AppError(fallbackMessage, `DB_${pgCode}`, error);
    }

    throw new AppError(fallbackMessage, code, error);
  }

  protected assertDefined<T>(value: T | null | undefined, errorMessage: string, code: string = "NOT_FOUND"): T {
    if (value === null || value === undefined) {
      throw new AppError(errorMessage, code);
    }
    return value;
  }
}
