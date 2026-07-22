"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  ["Безопасность", "/safety"],
  ["О проекте", "#about"],
  ["Как это работает", "#how"],
  ["Возможности", "#product"],
  ["Отзывы", "#reviews"],
  ["FAQ", "#faq"],
];

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-black/5 bg-white/80 backdrop-blur-xl" : "border-b border-transparent bg-[#F4F4F2]/80 backdrop-blur-sm"}`}>
      <div className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-5 sm:px-10 lg:px-16">
        <Link href="/" aria-label="Соседи — главная" className="relative z-[60] font-heading text-[25px] font-bold tracking-[-0.045em]">
          соседи<span className="text-[#A8CE00]">.</span>
        </Link>

        <nav aria-label="Главная навигация" className="hidden items-center gap-8 text-[13px] font-medium text-black/55 lg:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="relative py-2 transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all hover:text-black hover:after:w-full">{label}</a>
          ))}
        </nav>

        <div className="relative z-[60] flex items-center gap-2.5">
          <Link href="/app/roommates" className="group hidden h-11 items-center gap-2 rounded-full bg-[#D6FF3F] px-5 text-[13px] font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(163,197,28,0.2)] sm:inline-flex">
            Начать поиск
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"} className={`grid size-11 place-items-center rounded-full transition duration-300 ${mobileMenuOpen ? "rotate-90 bg-[#D6FF3F] text-black" : "bg-[#0D0D0C] text-white hover:scale-105"}`}>
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div id="mobile-navigation" aria-hidden={!mobileMenuOpen} className={`fixed inset-0 z-50 flex min-h-[100dvh] flex-col bg-[#0D0D0C] px-6 pb-8 pt-28 text-white transition duration-500 sm:px-10 ${mobileMenuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-5 opacity-0"}`}>
        <nav className="flex flex-1 flex-col justify-center gap-1">
          {links.map(([label, href], index) => (
            <a key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="group flex items-center justify-between border-b border-white/10 py-4 font-heading text-3xl font-bold tracking-[-0.035em] sm:text-5xl" style={{ transitionDelay: mobileMenuOpen ? `${index * 45}ms` : "0ms" }}>
              {label}<ArrowUpRight className="size-5 text-white/25 transition group-hover:text-[#D6FF3F]" />
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
          <span>Краснодар</span>
          <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-white">Войти в аккаунт</Link>
        </div>
      </div>
    </header>
  );
}
