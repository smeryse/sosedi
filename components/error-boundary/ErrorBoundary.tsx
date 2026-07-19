"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { ErrorFallback } from "./ErrorFallback";
import { cn } from "@/lib/utils";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "page" | "component" | "boundary";
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          level={this.props.level || "component"}
          resetErrorBoundary={() => this.reset()}
        />
      );
    }

    return this.props.children;
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Page-level error boundary (for use in layout.tsx)
export function PageErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ErrorBoundary
      level="page"
      fallback={
        <ErrorFallback
          level="page"
          error={null}
          resetErrorBoundary={() => window.location.reload()}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Component-level error boundary (for use around specific components)
export function ComponentErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary level="component" fallback={fallback}>
      {children}
    </ErrorBoundary>
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

// Import icons needed
import { MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
