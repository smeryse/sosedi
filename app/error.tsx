"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-background px-5 py-12 text-foreground">
      <section
        role="alert"
        aria-labelledby="error-title"
        className="w-full max-w-xl rounded-[32px] border bg-surface p-7 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-10"
      >
        <span className="grid size-12 place-items-center rounded-full bg-[#F3F9D2] text-[#6A8700]">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <h1 id="error-title" className="mt-7 text-3xl font-black tracking-[-0.045em]">
          Не удалось открыть страницу
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Попробуйте ещё раз. Если ошибка повторится, вернитесь на главную — введённые
          данные в других разделах останутся на месте.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-muted-foreground">Код ошибки: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 text-sm font-black text-accent-foreground transition hover:brightness-95"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Повторить
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm font-black transition hover:bg-secondary"
          >
            <Home className="size-4" aria-hidden="true" />
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
