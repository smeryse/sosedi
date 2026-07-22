"use client";

import { Award, Clock, MapPin, Zap } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

export function HackathonSection() {
  return (
    <section className="px-5 sm:px-10 lg:px-16 py-8">
      <Reveal className="max-w-7xl mx-auto bg-gradient-to-br from-[#A54726] to-[#8C3A1D] text-white rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D6FF3F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-[#D6FF3F] text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6 border border-white/10">
            <Zap className="size-3.5 fill-[#D6FF3F]" />
            Создано за 48 часов
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tight leading-[1.12]">
            Реальный кейс. Региональная задача.{" "}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }} className="not-italic font-normal text-[#D6FF3F]">
              Продукт с потенциалом.
            </em>
          </h2>

          <p className="mt-4 text-white/80 text-base md:text-lg leading-relaxed">
            Sosedi разработан на хакатоне по треку «Недвижимость» при поддержке Ассоциации застройщиков Краснодарского края и Республики Адыгея.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-10 border-t border-white/15">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 text-[#D6FF3F] mb-2">
              <Clock className="size-5" />
              <span className="text-3xl font-bold font-heading">48 часов</span>
            </div>
            <p className="text-xs text-white/70 leading-normal">
              полный цикл от идеи до рабочего MVP и интерактивного прототипа
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 text-[#D6FF3F] mb-2">
              <Award className="size-5" />
              <span className="text-3xl font-bold font-heading">300 000 ₽</span>
            </div>
            <p className="text-xs text-white/70 leading-normal">
              призовой фонд и грантовая поддержка трека
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 text-[#D6FF3F] mb-2">
              <MapPin className="size-5" />
              <span className="text-3xl font-bold font-heading">1 рынок</span>
            </div>
            <p className="text-xs text-white/70 leading-normal">
              Краснодарский край и Адыгея — высокий спрос на совместную аренду
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
