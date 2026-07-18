"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F4F4F0]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[80px] max-w-[1360px] items-center justify-between px-5 lg:px-8">
        <BrandLogo className="[&_img]:h-auto [&_img]:w-[142px]" />

        <nav className="hidden items-center gap-9 text-[13px] font-bold text-[#6B6F66] md:flex">
          <a href="#about" className="transition-colors hover:text-[#111111]">
            О проекте
          </a>
          <a href="#how" className="transition-colors hover:text-[#111111]">
            Как это работает
          </a>
          <a href="#product" className="transition-colors hover:text-[#111111]">
            Возможности
          </a>
          <a href="#reviews" className="transition-colors hover:text-[#111111]">
            Отзывы
          </a>
          <a href="#faq" className="transition-colors hover:text-[#111111]">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden text-[13px] font-extrabold text-[#111111] hover:underline sm:inline-block pr-2"
          >
            Войти
          </Link>
          <Link
            href="/app"
            className="lime-button inline-flex h-[44px] items-center gap-2 rounded-full px-5 text-[12.5px] font-black shadow-sm transition-transform hover:scale-[1.02]"
          >
            Начать поиск <ArrowRight className="size-4 stroke-[2.5]" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            className="grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Landing Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[80px] z-40 flex flex-col bg-[#F4F4F0] p-6 md:hidden animate-in fade-in duration-200 border-t border-[#E5E5E0]">
          <nav className="flex flex-col gap-4 text-lg font-extrabold text-[#111111]">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl p-3 hover:bg-[#EBF7B6]"
            >
              О проекте
            </a>
            <a
              href="#how"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl p-3 hover:bg-[#EBF7B6]"
            >
              Как это работает
            </a>
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl p-3 hover:bg-[#EBF7B6]"
            >
              Возможности
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl p-3 hover:bg-[#EBF7B6]"
            >
              Отзывы
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl p-3 hover:bg-[#EBF7B6]"
            >
              FAQ
            </a>
          </nav>

          <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[#E5E5E0]">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-12 w-full items-center justify-center rounded-full border border-[#E5E5E0] bg-white text-sm font-bold text-[#111111]"
            >
              Войти в аккаунт
            </Link>
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="lime-button flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-black"
            >
              Начать поиск <ArrowRight className="size-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
