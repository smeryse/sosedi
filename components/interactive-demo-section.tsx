"use client";

import { useState } from "react";
import { Check, ShieldCheck, Calendar, Sparkles } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Reveal } from "@/components/landing/reveal";

export function InteractiveDemoSection() {
  const [sleepTime, setSleepTime] = useState("23:30");
  const [guestFreq, setGuestFreq] = useState("Иногда");
  const [noiseLevel, setNoiseLevel] = useState("Тишина");
  const [jointPurchases, setJointPurchases] = useState(true);

  return (
    <section id="compatibility" className="relative z-10 bg-[#121311] text-white py-24 md:py-36 px-5 sm:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Reveal className="max-w-3xl mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D6FF3F] mb-3">
            <Sparkles className="size-3.5" />
            Интерактивный подбор
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tight leading-[1.15]">
            Совпадение, которое чувствуется ещё{" "}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }} className="not-italic font-normal text-[#D6FF3F]">
              до знакомства.
            </em>
          </h2>
          <p className="mt-4 text-white/60 text-base md:text-lg leading-relaxed">
            Мы собрали в одном процессе всё, что помогает принять уверенное решение и начать совместную жизнь без лишних сюрпризов.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-[#1C1D1A] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#D6FF3F]/20 text-[#D6FF3F] font-bold text-xs flex items-center justify-center border border-[#D6FF3F]/30">
                  01
                </span>
                <h3 className="text-xl font-semibold text-white">Профиль образа жизни</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Расскажите о себе и ваших бытовых привычках. Система учитывает мелкие детали, из которых складывается идеальный комфорт.
              </p>

              <div className="bg-[#141513] rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-white/70">Во сколько привыкли спать?</span>
                    <span className="text-[#D6FF3F] font-bold">{sleepTime}</span>
                  </div>
                  <input
                    type="range"
                    min="21"
                    max="26"
                    step="0.5"
                    value={sleepTime === "23:30" ? 23.5 : sleepTime === "22:00" ? 22 : sleepTime === "01:00" ? 25 : 23.5}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val <= 22) setSleepTime("22:00");
                      else if (val <= 23.5) setSleepTime("23:30");
                      else setSleepTime("01:00");
                    }}
                    className="w-full accent-[#D6FF3F] bg-white/10 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-white/40 mt-1">
                    <span>Ранняя пташка (22:00)</span>
                    <span>Сова (01:00)</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-white/70 block mb-2">Принимаете гостей?</span>
                  <div className="grid grid-cols-3 gap-2">
                    {["Редко", "Иногда", "Часто"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setGuestFreq(opt)}
                        className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          guestFreq === opt
                            ? "bg-[#D6FF3F] text-black border-[#D6FF3F]"
                            : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-white/70 block mb-2">Отношение к шуму</span>
                  <div className="flex items-center gap-2">
                    {["Тишина", "Умеренно", "Шумно"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNoiseLevel(opt)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          noiseLevel === opt
                            ? "bg-[#D6FF3F]/20 text-[#D6FF3F] border-[#D6FF3F]/50"
                            : "bg-white/5 text-white/50 border-white/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-medium text-white/70">Готовность к совместным покупкам</span>
                  <button
                    type="button"
                    onClick={() => setJointPurchases((prev) => !prev)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      jointPurchases ? "bg-[#D6FF3F]" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        jointPurchases ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1D1A] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#D6FF3F]/20 text-[#D6FF3F] font-bold text-xs flex items-center justify-center border border-[#D6FF3F]/30">
                  02
                </span>
                <h3 className="text-xl font-semibold text-white">Умный подбор соседей</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Алгоритм анализирует сигналы и показывает тех, с кем вам по-настоящему комфортно жить под одной крышей.
              </p>

              <div className="bg-[#141513] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <AvatarImage src="/demo/people/maria.jpg" name="Алёна" size={44} className="ring-2 ring-[#D6FF3F]" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Алёна, 24</h4>
                      <p className="text-[11px] text-white/50">Маркетолог</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#D6FF3F] leading-none">92%</div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Совместимость</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <AvatarImage src="/demo/people/ekaterina.jpg" name="Мария" size={44} className="ring-2 ring-[#D6FF3F]" />
                    <div className="text-right">
                      <h4 className="text-sm font-semibold text-white">Мария, 23</h4>
                      <p className="text-[11px] text-white/50">UX-дизайнер</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[#D6FF3F]/10 border border-[#D6FF3F]/20">
                    <span className="text-[#D6FF3F] font-medium flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#D6FF3F]" /> Совпадает
                    </span>
                    <span className="text-white/60 text-[11px]">График сна &amp; Работа удалённо</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/70 font-medium flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-amber-400" /> Стоит обсудить
                    </span>
                    <span className="text-white/50 text-[11px]">Частота приема гостей</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1D1A] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#D6FF3F]/20 text-[#D6FF3F] font-bold text-xs flex items-center justify-center border border-[#D6FF3F]/30">
                  03
                </span>
                <h3 className="text-xl font-semibold text-white">Безопасное знакомство</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Общайтесь в чате платформы, задавайте любые вопросы и знакомьтесь до встречи в реальной жизни.
              </p>

              <div className="bg-[#141513] rounded-2xl p-4 border border-white/5">
                <div className="flex flex-col gap-3 mb-3">
                  <div className="self-start bg-white/10 text-white/90 text-xs px-3.5 py-2 rounded-2xl rounded-tl-none max-w-[80%]">
                    Привет! Как обычно проходит твой рабочий день? Работаешь из дома?
                  </div>
                  <div className="self-end bg-[#D6FF3F] text-black text-xs font-medium px-3.5 py-2 rounded-2xl rounded-tr-none max-w-[80%]">
                    Привет! Я большую часть дня работаю в тишине. Офис пару дней в неделю.
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 text-[11px] text-white/50">
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="size-3 text-[#D6FF3F]" /> Профиль верифицирован
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                    <Check className="size-3 text-[#D6FF3F]" /> Данные защищены
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1D1A] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#D6FF3F]/20 text-[#D6FF3F] font-bold text-xs flex items-center justify-center border border-[#D6FF3F]/30">
                  04
                </span>
                <h3 className="text-xl font-semibold text-white">Совместное заселение</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Подключайтесь к прозрачному процессу: фиксируйте договор, распределяйте счета и бытовые обязанности.
              </p>

              <div className="bg-[#141513] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-white/60 font-medium">Чек-лист заселения</span>
                  <span className="text-[#D6FF3F] font-bold">3 из 5 выполнено</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#D6FF3F]">
                    <div className="size-4 rounded-full bg-[#D6FF3F]/20 grid place-items-center border border-[#D6FF3F]">
                      <Check className="size-2.5 text-[#D6FF3F]" />
                    </div>
                    <span>Обсудить правила проживания</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#D6FF3F]">
                    <div className="size-4 rounded-full bg-[#D6FF3F]/20 grid place-items-center border border-[#D6FF3F]">
                      <Check className="size-2.5 text-[#D6FF3F]" />
                    </div>
                    <span>Подписать договор аренды</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <div className="size-4 rounded-full border border-white/20" />
                    <span>Составить опись имущества</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-[#D6FF3F]" /> Заселение: 15 июня
                  </span>
                  <span className="text-[#D6FF3F] font-semibold">Краснодар</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
