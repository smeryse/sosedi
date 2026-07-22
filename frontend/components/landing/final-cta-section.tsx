"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { Reveal } from "@/components/landing/reveal";

export function FinalCtaSection() {
  return (
    <section className="relative min-h-[520px] overflow-hidden border-t border-white/10 bg-[#0B0C0A] text-white">
      <MediaImage
        src="/demo/properties/yubileyniy-room.jpg"
        alt="Уютная спальня для совместной аренды"
        sizes="100vw"
        className="object-cover transition duration-1000 hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/25" />

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-24 sm:px-10 lg:px-16">
        <Reveal className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D6FF3F]">
            <span className="size-2 rounded-full bg-[#D6FF3F]" /> Пора
            знакомиться
          </p>
          <h2 className="mt-6 font-heading text-4xl font-bold leading-[0.98] tracking-tight sm:text-5xl md:text-6xl">
            Готовы найти <br />
            <em
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
              }}
              className="not-italic text-[#D6FF3F]"
            >
              своё место?
            </em>
          </h2>
          <p className="mt-5 max-w-xl text-base text-white/65 md:text-lg">
            Начните с анкеты совместимости — это займёт около трёх минут.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/app/compatibility"
              className="flex items-center justify-center gap-2 rounded-full bg-[#D6FF3F] px-8 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-1 hover:bg-[#c4ed27]"
            >
              Создать профиль
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/owner/properties/new"
              className="rounded-full border border-white/15 bg-white/10 px-8 py-3.5 text-center text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Разместить жильё
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
