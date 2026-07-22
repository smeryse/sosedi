"use client";

import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const questions = [
  {
    question: "Профили действительно проверяют?",
    answer:
      "Да. Мы подтверждаем телефон и основные данные, а подозрительные анкеты отправляем на ручную проверку.",
  },
  {
    question: "Подбор соседей платный?",
    answer:
      "Базовый поиск и просмотр совпадений доступны бесплатно. Дополнительные функции можно подключить позже.",
  },
  {
    question: "Можно искать только квартиру?",
    answer:
      "Да. Вы можете прийти своей группой или сначала найти жильё, а затем добрать соседей.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="bg-[#121311] px-5 py-24 text-white sm:px-10 md:py-32 lg:px-16"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D6FF3F]">
            <span className="size-2 rounded-full bg-[#D6FF3F]" /> Коротко о
            важном
          </p>
          <h2 className="mt-5 font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Можно спросить
          </h2>
        </Reveal>

        <Reveal
          delay={0.1}
          className="divide-y divide-white/10 border-y border-white/10"
        >
          {questions.map(({ question, answer }, index) => (
            <details key={question} open={index === 0} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-heading text-lg font-bold">
                <span>{question}</span>
                <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="max-w-[650px] pr-10 pt-3 text-sm leading-relaxed text-white/55">
                {answer}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
