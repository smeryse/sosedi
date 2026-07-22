from typing import Any


class AppError(Exception):
    def __init__(self, code: str, message: str, details: Any = None):
        self.code = code
        self.message = message
        self.details = details
        super().__init__(message)


def handle_database_error(exc: Exception) -> AppError:
    msg = str(exc)
    if "foreign_key_violation" in msg:
        return AppError("REFERENCE_NOT_FOUND", "Referenced record not found")
    if "unique_violation" in msg:
        return AppError("DUPLICATE", "Record already exists")
    if "serialization_failure" in msg:
        return AppError("CONCURRENCY", "Concurrent modification, retry")
    return AppError("DATABASE_ERROR", "A database error occurred")
