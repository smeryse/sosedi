"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, Home, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error | null;
  level: "page" | "component" | "boundary";
  resetErrorBoundary: () => void;
}

export function ErrorFallback({
  error,
  level,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    // Allow retry after a short delay to prevent rapid retries
    const timer = setTimeout(() => setCanRetry(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    if (canRetry) {
      resetErrorBoundary();
    }
  };

  const handleHome = () => {
    window.location.href = "/";
  };

  const isPageLevel = level === "page";

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-6 p-8 text-center",
        isPageLevel ? "w-full" : "rounded-[18px] border border-destructive/20 bg-destructive/5"
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle
        className={cn(
          "text-destructive flex-shrink-0",
          isPageLevel ? "size-16" : "size-10"
        )}
        aria-hidden="true"
      />

      <div className="space-y-2 max-w-md">
        <h2
          className={cn(
            "font-black text-foreground",
            isPageLevel ? "text-2xl" : "text-lg"
          )}
        >
          {isPageLevel
            ? "Что-то пошло не так"
            : "Не удалось загрузить этот компонент"}
        </h2>

        <p className={cn("text-muted-foreground", isPageLevel ? "text-base" : "text-sm")}>
          {error?.message
            ? `Ошибка: ${error.message}`
            : "Произошла непредвиденная ошибка. Мы уже знаем об этом и работаем над исправлением."}
        </p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="text-left mt-4 p-3 bg-muted/50 rounded-md text-xs">
            <summary className="cursor-pointer font-mono text-foreground mb-2">
              Детали ошибки (development)
            </summary>
            <pre className="whitespace-pre-wrap font-mono text-muted-foreground">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>

      <div
        className={cn(
          "flex gap-3 flex-wrap justify-center",
          isPageLevel ? "mt-2" : "mt-4"
        )}
      >
        {canRetry && (
          <Button
            onClick={handleRetry}
            variant="default"
            size={isPageLevel ? "lg" : "default"}
            className="gap-2"
            disabled={!canRetry}
          >
            <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
            Попробовать снова
          </Button>
        )}

        {isPageLevel && (
          <Button
            onClick={handleHome}
            variant="outline"
            size={isPageLevel ? "lg" : "default"}
            className="gap-2"
          >
            <Home className="size-4" aria-hidden="true" />
            На главную
          </Button>
        )}

        {!isPageLevel && (
          <Button
            onClick={handleRetry}
            variant="ghost"
            size="sm"
            disabled={!canRetry}
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            Сообщить о проблеме
          </Button>
        )}
      </div>

      {isPageLevel && (
        <p className="text-xs text-muted-foreground/60 mt-4">
          Если проблема повторяется, попробуйте обновить страницу или обратитесь в поддержку
        </p>
      )}
    </div>
  );
}

// Specialized fallbacks for common scenarios
export function DatabaseErrorFallback({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <ErrorFallback
      error={new Error("Database connection failed")}
      level="component"
      resetErrorBoundary={onRetry}
    />
  );
}

export function NetworkErrorFallback({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <ErrorFallback
      error={new Error("Network error")}
      level="component"
      resetErrorBoundary={onRetry}
    />
  );
}

export function NotFoundFallback() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-6 p-8 text-center">
      <MessageCircle className="size-16 text-muted-foreground/40" aria-hidden="true" />
      <div className="space-y-2 max-w-md">
        <h2 className="font-black text-xl text-foreground">Страница не найдена</h2>
        <p className="text-muted-foreground">
          Запрашиваемая страница не существует или была перемещена.
        </p>
      </div>
      <Button onClick={() => window.history.back()} variant="outline" className="gap-2">
        <MessageCircle className="size-4" aria-hidden="true" />
        Вернуться назад
      </Button>
    </div>
  );
}

export function UnauthorizedFallback() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-6 p-8 text-center">
      <AlertTriangle className="size-16 text-warning" aria-hidden="true" />
      <div className="space-y-2 max-w-md">
        <h2 className="font-black text-2xl text-foreground">Доступ ограничен</h2>
        <p className="text-muted-foreground">
          Для доступа к этой странице необходимо войти в систему.
        </p>
      </div>
      <Button
        onClick={() => {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }}
        className="gap-2"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Войти
      </Button>
    </div>
  );
}
