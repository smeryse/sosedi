"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MediaImage } from "@/components/ui/media-image";

export function OwnerSection() {
  const candidateGroups = [
    {
      id: 1,
      names: "Алёна + Мария",
      score: "92%",
      avatars: ["maria", "ekaterina"],
      status: "Верифицированы",
    },
    {
      id: 2,
      names: "Игорь + Даниил",
      score: "87%",
      avatars: ["artem", "ilya"],
      status: "Готовы к показу",
    },
    {
      id: 3,
      names: "Екатерина + София",
      score: "85%",
      avatars: ["ekaterina", "maria"],
      status: "Верифицированы",
    },
  ];

  return (
    <section id="owners" className="relative z-10 bg-[#F4F4F0] text-black py-24 md:py-36 px-5 sm:px-10 lg:px-16 overflow-hidden border-t border-b border-black/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#321C04] mb-4">
            <span className="size-2 rounded-full bg-[#A8CE00]" />
            Для собственников
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-black tracking-tight leading-[1.12]">
            Надёжные жильцы. <br />
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }} className="not-italic font-normal text-[#321C04] underline decoration-[#A8CE00] underline-offset-4 decoration-2">
              Меньше пустующих квартир.
            </em>
          </h2>

          <p className="mt-6 text-black/65 text-base md:text-lg leading-relaxed max-w-xl">
            Получайте сформированные группы жильцов с понятными профилями, подтверждённой совместимостью и готовностью к заселению. Экономьте время и снижайте риски простоя.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link
              href="/owner/properties/new"
              className="group inline-flex items-center justify-center gap-2.5 bg-[#0D0D0C] hover:bg-[#A8CE00] text-white hover:text-black font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-300 shadow-md"
            >
              <span>Разместить объект</span>
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/owners"
              className="text-xs font-semibold text-black/70 hover:text-black transition-colors underline underline-offset-4"
            >
              Узнать больше для собственников →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5">
          <div className="flex flex-col sm:flex-row gap-5 items-start pb-6 border-b border-black/10">
            <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden relative shrink-0 bg-black/10">
              <MediaImage
                src="/demo/properties/center-loft.jpg"
                alt="Краснодар, Панорама"
                sizes="(min-width: 640px) 144px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <span className="text-[11px] font-semibold text-[#628B36] uppercase tracking-wider bg-[#A8CE00]/15 px-2.5 py-1 rounded-full">
                Активно подбираются жильцы
              </span>
              <h3 className="text-lg font-bold text-black mt-2">Краснодар, район Панорама</h3>
              <p className="text-xs text-black/60">3-комнатная квартира • 65 м²</p>
              <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                <span className="text-black">48 000 ₽ / мес</span>
                <span className="text-xs font-medium text-black/50 bg-black/5 px-2.5 py-1 rounded-lg">
                  2 из 3 мест занято
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Кандидаты на заселение</span>
              <span>Совместимость</span>
            </h4>

            <div className="space-y-3">
              {candidateGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F8F5] border border-black/5 hover:border-black/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {group.avatars.map((av, i) => (
                        <AvatarImage
                          key={i}
                          src={`/demo/people/${av}.jpg`}
                          name={group.names}
                          size={34}
                          className="ring-2 ring-white"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-black flex items-center gap-1.5">
                        {group.names}
                        <CheckCircle2 className="size-3.5 text-[#628B36]" />
                      </div>
                      <span className="text-[11px] text-black/50">{group.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#628B36]">{group.score}</span>
                    <button
                      type="button"
                      className="text-xs font-semibold bg-black text-white px-3 py-1.5 rounded-xl hover:bg-[#A8CE00] hover:text-black transition-colors"
                    >
                      Пригласить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
