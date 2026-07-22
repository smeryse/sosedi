"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Как это работает", href: "#how" },
    { label: "Совместимость", href: "#compatibility" },
    { label: "Отзывы", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl flex flex-col items-center">
      <nav className="w-full bg-white/95 dark:bg-[#111110]/95 backdrop-blur-md rounded-full shadow-xl px-6 py-3 flex items-center justify-between border border-black/5 dark:border-white/10 transition-all duration-300">
        
        {/* Logo */}
        <BrandLogo className="[&_img]:h-auto [&_img]:w-[138px] dark:[&_img]:brightness-0 dark:[&_img]:invert" />

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white px-4 py-2 transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/auth/sign-up"
            className="bg-[#D6FF3F] hover:bg-[#c4ed27] text-black font-semibold text-xs px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-lime-500/10"
          >
            Регистрация
          </Link>
        </div>

        {/* Mobile menu button & Small actions (Hidden on Desktop) */}
        <div className="flex lg:hidden items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex text-xs font-semibold text-black/80 dark:text-white/80 px-3 py-1.5"
          >
            Войти
          </Link>
          
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label="Переключить меню"
            className="relative size-9 flex flex-col items-center justify-center gap-1.5 focus:outline-none rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span
              className={`w-4 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out ${
                isOpen ? "rotate-45 translate-y-[3px]" : ""
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out ${
                isOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Panel */}
      <div
        className={`w-full mt-2 lg:hidden bg-white/95 dark:bg-[#111110]/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-black/5 dark:border-white/10 transition-all duration-300 ease-out origin-top ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between group"
            >
              <span>{link.label}</span>
              <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#A8CE00]" />
            </a>
          ))}
          <div className="pt-2 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm font-semibold text-black dark:text-white py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/10"
            >
              Войти
            </Link>
            <Link
              href="/auth/sign-up"
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#D6FF3F] text-black font-semibold text-center text-sm py-2.5 rounded-xl hover:bg-[#c4ed27] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Регистрация</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
