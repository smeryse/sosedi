"use client";

import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { landingMetrics } from "@/data/landing";

export function AboutSection() {
  return (
    <section className="relative z-10 bg-[#F6E4CF] text-[#321C04] rounded-t-[25px] mt-[-25px] py-20 md:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <Reveal className="max-w-xl text-center flex flex-col items-center">
          <p className="text-base md:text-lg leading-relaxed text-[#321C04]/90 font-medium">
            Мы создаём сервисы, которые двигаются в вашем ритме, а не вопреки ему. Поиск квартиры и соседей — без лишнего стресса, хаоса и неопределенности.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app/roommates"
              className="bg-[#321C04] hover:bg-[#1F1003] text-[#FFF9F2] rounded-full pl-2 pr-6 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-colors shadow-md group"
            >
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#321C04] group-hover:scale-105 transition-transform">
                <Users className="size-4" />
              </span>
              <span>Подобрать соседей</span>
            </Link>

            <Link
              href="/owner/properties/new"
              className="bg-[#D9C4AA] hover:bg-[#CEBA9E] text-[#321C04] rounded-full pl-2 pr-6 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-colors shadow-sm group"
            >
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#321C04] group-hover:scale-105 transition-transform">
                <Plus className="size-4" />
              </span>
              <span>Разместить жильё</span>
            </Link>
          </div>
        </Reveal>

        <div className="w-full max-w-6xl my-16 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#D9C4AA]" />
          <div className="flex-1 h-[2px] bg-[#D9C4AA]" />
          <div className="w-2 h-2 rounded-full bg-[#D9C4AA]" />
        </div>

        <div className="w-full max-w-6xl flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="flex items-center gap-4 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 256 256"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M 256 256 L 178 256 C 150.386 256 128 233.614 128 206 L 128 256 L 0 256 L 0 192 C 0 156.654 28.654 128 64 128 C 99.346 128 128 156.654 128 192 L 128 128 L 256 128 Z M 78 0 C 105.614 0 128 22.386 128 50 L 128 0 L 256 0 L 256 64 C 256 99.346 227.346 128 192 128 C 156.654 128 128 99.346 128 64 L 128 128 L 0 128 L 0 0 Z"
                fill="#321C04"
              />
            </svg>
            <div className="text-xs uppercase tracking-widest font-semibold text-[#321C04]/80 leading-snug">
              Совместимость
              <br />
              Доверие &amp; Уют
            </div>
          </div>

          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] leading-[1.3] font-normal text-[#321C04]">
              Совместная аренда начинается не с квадратных метров. Она начинается с{" "}
              <em
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
                className="not-italic font-normal underline decoration-[#A8CE00] underline-offset-4 decoration-2"
              >
                доверия
              </em>
              , совпадения привычек и понимания того,{" "}
              <em
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
                className="not-italic font-normal underline decoration-[#A8CE00] underline-offset-4 decoration-2"
              >
                как вы хотите жить каждый день
              </em>
              . Мы несём всю коммуникационную нагрузку, чтобы вы чувствовали себя спокойно.
            </h2>
          </div>
        </div>

        <div className="mt-16 grid w-full max-w-6xl grid-cols-2 border-y border-[#D9C4AA] md:grid-cols-4 md:border-y-0">
          {landingMetrics.map((metric, index) => (
            <Reveal
              key={metric.label}
              delay={index * 0.07}
              className={`py-7 text-center ${index % 2 ? "border-l border-[#D9C4AA]" : ""} ${
                index > 1 ? "border-t border-[#D9C4AA] md:border-t-0" : ""
              } ${index === 2 ? "md:border-l" : ""}`}
            >
              <p className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{metric.value}</p>
              <p className="mt-1 text-xs text-[#321C04]/60">{metric.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
