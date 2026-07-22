import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F3EA] px-5 py-12 text-[#111111]">
      <section className="w-full max-w-xl rounded-[32px] border border-black/10 bg-[#FFFFFC] p-7 shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-10">
        <BrandLogo className="[&_img]:h-auto [&_img]:w-[118px]" />
        <p className="mt-12 text-xs font-black uppercase tracking-[0.16em] text-[#7B9E00]">
          Ошибка 404
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          Такой страницы нет.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-black/60">
          Возможно, ссылка устарела или адрес введён с ошибкой. Вернитесь на главную
          или продолжите поиск жилья.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            На главную
          </Link>
          <Link
            href="/app/housing"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-black/15 px-5 text-sm font-black transition hover:border-[#95B800] hover:bg-[#F3F9D2]"
          >
            <Search className="size-4" aria-hidden="true" />
            Найти жильё
          </Link>
        </div>
      </section>
    </main>
  );
}
