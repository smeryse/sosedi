import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F5F3EA] text-[#111111]">
      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
        <BrandLogo className="[&_img]:h-auto [&_img]:w-[118px]" />
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-bold text-black/60 transition hover:bg-black/5 hover:text-black"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          На главную
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#728F00]">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-black/65">{intro}</p>
        <p className="mt-4 text-xs font-semibold text-black/45">Обновлено 22 июля 2026 года</p>

        <div className="mt-12 space-y-5">{children}</div>

        <footer className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-black/10 pt-7 text-xs font-bold text-black/60">
          <Link href="/safety" className="inline-flex min-h-11 items-center hover:text-black">Безопасность</Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-black">Конфиденциальность</Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-black">Правила сервиса</Link>
          <a href="mailto:hello@sosedi.app" className="inline-flex min-h-11 items-center hover:text-black">hello@sosedi.app</a>
        </footer>
      </article>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-black/10 bg-[#FFFFFC] p-5 sm:p-7">
      <h2 className="text-lg font-black tracking-[-0.02em]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-black/65">{children}</div>
    </section>
  );
}
