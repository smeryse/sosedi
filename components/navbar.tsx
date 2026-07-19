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
    { label: "Собственникам", href: "#owners" },
    { label: "Безопасность", href: "/safety" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg flex flex-col items-center">
      <nav className="w-full bg-white/95 dark:bg-[#111110]/95 backdrop-blur-md rounded-full shadow-xl px-5 py-3 flex items-center justify-between border border-black/5 dark:border-white/10 transition-all duration-300">
        <BrandLogo className="[&_img]:h-auto [&_img]:w-[138px] dark:[&_img]:brightness-0 dark:[&_img]:invert" />

        <div className="flex items-center gap-3">
          <Link
            href="/app/roommates"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#D6FF3F] hover:bg-[#c4ed27] text-black font-semibold text-xs px-4 py-2 rounded-full transition-all duration-200"
          >
            <span>Найти соседей</span>
            <ArrowUpRight className="size-3.5" />
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

      <div
        className={`w-full mt-2 bg-white/95 dark:bg-[#111110]/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-black/5 dark:border-white/10 transition-all duration-300 ease-out origin-top ${
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
              href="/app/roommates"
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#D6FF3F] text-black font-semibold text-center text-sm py-2.5 rounded-xl hover:bg-[#c4ed27] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Подобрать соседей</span>
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/owner/properties/new"
              onClick={() => setIsOpen(false)}
              className="w-full bg-black/5 dark:bg-white/10 text-black dark:text-white font-medium text-center text-sm py-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              Разместить жильё
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
