"use client";

import Link from "next/link";
import { Mail, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#0B0C0A] text-white pt-20 pb-12 px-5 sm:px-10 lg:px-16 overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <Link href="/" className="font-heading text-3xl font-bold tracking-tight text-white flex items-center mb-3">
                sosedi<span className="text-[#D6FF3F] text-4xl leading-none">.</span>
              </Link>
              <p className="text-white/60 text-sm max-w-sm leading-relaxed">
                Жить вместе. Понимать друг друга. Сервис умного подбора жилья и совместимых соседей в Краснодарском крае.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <a
                href="mailto:hello@sosedi.app"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs px-4 py-2.5 rounded-full border border-white/10 transition-colors"
              >
                <Mail className="size-3.5 text-[#D6FF3F]" />
                <span>hello@sosedi.app</span>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="size-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 transition-colors"
                aria-label="Telegram"
              >
                <Send className="size-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Навигация</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#how" className="text-white/70 hover:text-[#D6FF3F] transition-colors">
                  Как это работает
                </a>
              </li>
              <li>
                <a href="#compatibility" className="text-white/70 hover:text-[#D6FF3F] transition-colors">
                  Совместимость
                </a>
              </li>
              <li>
                <a href="#owners" className="text-white/70 hover:text-[#D6FF3F] transition-colors">
                  Собственникам
                </a>
              </li>
              <li>
                <a href="#safety" className="text-white/70 hover:text-[#D6FF3F] transition-colors">
                  Безопасность
                </a>
              </li>
              <li>
                <Link href="/app/roommates" className="text-white/70 hover:text-[#D6FF3F] transition-colors">
                  Каталог соседей
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Region */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Регион &amp; Проект</h4>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Разработано в рамках хакатона по треку «Недвижимость» при поддержке Ассоциации застройщиков Краснодарского края и Республики Адыгея.
            </p>
            <div className="text-xs text-white/40">
              Краснодар • MVP 2026
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div>© 2026 Sosedi. Все права защищены.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Пользовательское соглашение
            </a>
          </div>
        </div>
      </div>

      {/* Giant Background Watermark Logo */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[clamp(6rem,20vw,24rem)] font-bold text-white/[0.03] select-none pointer-events-none tracking-tighter whitespace-nowrap">
        sosedi.
      </div>
    </footer>
  );
}
