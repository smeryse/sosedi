"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Sparkles,
  Zap,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Users,
  MessageSquare,
  DollarSign,
  Moon,
  Dog,
} from "lucide-react";
import { LivingDNACard } from "@/components/tenant/living-dna-card";

interface ScenarioOption {
  text: string;
  impact: {
    cleanliness: number;
    sleepHarmony: number;
    financialHealth: number;
    communication: number;
    guestTolerance: number;
    xp: number;
  };
  feedback: string;
}

interface Scenario {
  id: number;
  day: number;
  category: string;
  icon: any;
  title: string;
  description: string;
  options: ScenarioOption[];
}

const scenarios: Scenario[] = [
  {
    id: 1,
    day: 14,
    category: "Шум и режим дня",
    icon: Moon,
    title: "Шумная настолка перед экзаменом",
    description:
      "У твоей сожительницы Марии собрались друзья в гостиной на громкую настольную игру, а у тебя завтра в 9:00 критически важный созвон / экзамен.",
    options: [
      {
        text: "Спокойно выйти в гостиную, объяснить ситуацию и предложить перенести игру в комнату.",
        impact: { cleanliness: 0, sleepHarmony: 20, financialHealth: 0, communication: 25, guestTolerance: 10, xp: 50 },
        feedback: "Прямой и экологичный диалог! Конфликт предотвращен на 100%.",
      },
      {
        text: "Отправить сообщение в общий чат с помощью ИИ-посредника, который мягко сгладит углы.",
        impact: { cleanliness: 0, sleepHarmony: 15, financialHealth: 0, communication: 20, guestTolerance: 15, xp: 40 },
        feedback: "ИИ-посредник деликатно передал просьбу, гости притихли через 5 минут.",
      },
      {
        text: "Закрыть дверь, надеть беруши и промолчать, затаив обиду.",
        impact: { cleanliness: 0, sleepHarmony: -15, financialHealth: 0, communication: -20, guestTolerance: -10, xp: 10 },
        feedback: "Накопленный негатив повышает риск конфликта в будущем на 35%.",
      },
    ],
  },
  {
    id: 2,
    day: 38,
    category: "Бытовая химия и закупки",
    icon: Sparkles,
    title: "Закончились общие расходники",
    description:
      "В квартире внезапно закончились средство для мытья посуды и туалетная бумага. На этой неделе была твоя очередь дежурства по закупкам.",
    options: [
      {
        text: "Заказать мгновенную доставку из общего бюджета группы и сбросить чек в чат.",
        impact: { cleanliness: 25, sleepHarmony: 0, financialHealth: 15, communication: 20, guestTolerance: 0, xp: 50 },
        feedback: "Отличная организация! Бытовая прозрачность +100%.",
      },
      {
        text: "Купить самостоятельно после работы и принести вечером.",
        impact: { cleanliness: 15, sleepHarmony: 0, financialHealth: 10, communication: 10, guestTolerance: 0, xp: 35 },
        feedback: "Забота о доме проявлена, но лучше автоматизировать закупки.",
      },
    ],
  },
  {
    id: 3,
    day: 65,
    category: "Внезапные расходы",
    icon: DollarSign,
    title: "Сломалась стиральная машина",
    description:
      "Стиральная машина выдала ошибку слива. Мастер оценил ремонт в 3 600 ₽. Собственник просит временно оплатить ремонт вам с последующим вычетом из арендной платы.",
    options: [
      {
        text: "Оплатить из общего Фонда Соседей и отправить квитанцию собственнику через авто-шаблон.",
        impact: { cleanliness: 10, sleepHarmony: 0, financialHealth: 25, communication: 20, guestTolerance: 0, xp: 60 },
        feedback: "Идеальное решение без задержек и разногласий!",
      },
      {
        text: "Разделить 3 600 ₽ поровну между сожителями прямо сейчас.",
        impact: { cleanliness: 0, sleepHarmony: 0, financialHealth: 15, communication: 15, guestTolerance: 0, xp: 40 },
        feedback: "Быстрый сбор средств, финансовый кассовый разрыв закрыт.",
      },
    ],
  },
  {
    id: 4,
    day: 92,
    category: "Домашние питомцы",
    icon: Dog,
    title: "Котенка привели без предупреждения",
    description:
      "Сожительница взяла котенка подруги на передержку на 3 дня, не предупредив заранее.",
    options: [
      {
        text: "Поиграть с котенком и предложить зафиксировать правило согласования питомцев за 24 часа.",
        impact: { cleanliness: 0, sleepHarmony: 10, financialHealth: 0, communication: 25, guestTolerance: 20, xp: 55 },
        feedback: "Мудрое решение: радость общения + четкие правила!",
      },
      {
        text: "Напомнить о пункте соглашения и попросить больше так не делать.",
        impact: { cleanliness: 10, sleepHarmony: 5, financialHealth: 0, communication: 15, guestTolerance: -5, xp: 30 },
        feedback: "Границы обозначены корректно.",
      },
    ],
  },
];

export default function SimulatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userXp, setUserXp] = useState(420);
  const [scores, setScores] = useState({
    cleanliness: 82,
    sleepHarmony: 85,
    financialHealth: 88,
    communication: 86,
    guestTolerance: 80,
    overallCompatibility: 88,
  });
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [agreements, setAgreements] = useState<string[]>([
    "Тихие часы: с 23:00 до 08:00 в будние дни",
    "Закупка общих расходников из Резервного Фонда группы",
  ]);
  const [copied, setCopied] = useState(false);

  const activeScenario = scenarios[currentStep];
  const isFinished = currentStep >= scenarios.length;

  const handleOptionSelect = (opt: ScenarioOption) => {
    const newCleanliness = Math.min(100, Math.max(50, scores.cleanliness + opt.impact.cleanliness));
    const newSleep = Math.min(100, Math.max(50, scores.sleepHarmony + opt.impact.sleepHarmony));
    const newFinancial = Math.min(100, Math.max(50, scores.financialHealth + opt.impact.financialHealth));
    const newComm = Math.min(100, Math.max(50, scores.communication + opt.impact.communication));
    const newGuest = Math.min(100, Math.max(50, scores.guestTolerance + opt.impact.guestTolerance));

    const overall = Math.round(
      (newCleanliness + newSleep + newFinancial + newComm + newGuest) / 5
    );

    setScores({
      cleanliness: newCleanliness,
      sleepHarmony: newSleep,
      financialHealth: newFinancial,
      communication: newComm,
      guestTolerance: newGuest,
      overallCompatibility: overall,
    });

    setUserXp((prev) => prev + opt.impact.xp);
    setLastFeedback(opt.feedback);

    // Auto-generate agreement rule based on category
    if (activeScenario.category === "Шум и режим дня" && !agreements.includes("Согласование громких мероприятий за 12 часов")) {
      setAgreements((prev) => [...prev, "Согласование громких мероприятий за 12 часов"]);
    } else if (activeScenario.category === "Внезапные расходы" && !agreements.includes("Ремонт бытовой техники из Фонда Соседей")) {
      setAgreements((prev) => [...prev, "Ремонт бытовой техники из Фонда Соседей"]);
    } else if (activeScenario.category === "Домашние питомцы" && !agreements.includes("Передержка питомцев только по согласованию всей группы")) {
      setAgreements((prev) => [...prev, "Передержка питомцев только по согласованию всей группы"]);
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setUserXp(420);
    setScores({
      cleanliness: 82,
      sleepHarmony: 85,
      financialHealth: 88,
      communication: 86,
      guestTolerance: 80,
      overallCompatibility: 88,
    });
    setLastFeedback(null);
  };

  const copyAgreement = () => {
    const text = `📜 УМНЫЙ ДОГОВОР БЫТА И СОЖИТЕЛЬСТВА\n\nСгенерирован на основе 10 000 симуляций быта:\n\n` +
      agreements.map((a, i) => `${i + 1}. ${a}`).join("\n") +
      `\n\nИндекс гармонии: ${scores.overallCompatibility}%\nПлатформа «Соседи»`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Gamification Header Bar */}
      <div className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#B3DB00] to-[#7B9E00] text-[#111111] shadow-lg shadow-[#B3DB00]/30">
            <Gamepad2 className="size-8 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#111111] px-2.5 py-0.5 text-[10.5px] font-black text-[#B3DB00]">
                LEVEL 4
              </span>
              <span className="text-[12px] font-extrabold text-[#6B6F66]">
                Сожитель-Мастер
              </span>
            </div>
            <h1 className="mt-1 text-[22px] font-black text-[#111111]">
              Симулятор 6 месяцев быта 🎮
            </h1>
          </div>
        </div>

        {/* XP Progress & Badges */}
        <div className="flex items-center gap-4">
          <div className="min-w-[180px] space-y-1.5">
            <div className="flex justify-between text-[11.5px] font-black text-[#111111]">
              <span>Опыт (XP)</span>
              <span>{userXp} / 1 000 XP</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#F4F4F0]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B3DB00] to-[#7B9E00] transition-all duration-300"
                style={{ width: `${(userXp / 1000) * 100}%` }}
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-[#E5E5E0] pl-4">
            <span title="Мастер компромиссов" className="grid size-10 place-items-center rounded-xl bg-[#F3F9D2] text-[18px] shadow-sm">
              🤝
            </span>
            <span title="Финансовый ниндзя" className="grid size-10 place-items-center rounded-xl bg-[#F3F9D2] text-[18px] shadow-sm">
              💰
            </span>
            <span title="Хранитель чистоты" className="grid size-10 place-items-center rounded-xl bg-[#F3F9D2] text-[18px] shadow-sm">
              🧹
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Stage (Simulator) & Right Stage (Living DNA & Agreement) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Scenario Card */}
        <div className="lg:col-span-7 space-y-6">
          {!isFinished ? (
            <div className="surface-card p-6 md:p-8 space-y-6 relative overflow-hidden border-2 border-[#B3DB00]/50 shadow-xl">
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF7B6] px-3 py-1 text-[11px] font-black text-[#111111]">
                  <Zap className="size-3.5 text-[#7B9E00]" />
                  Сценарий {currentStep + 1} из {scenarios.length}
                </span>
                <span className="text-[12px] font-extrabold text-[#7B9E00]">
                  День {activeScenario.day} симуляции
                </span>
              </div>

              {/* Scenario Info */}
              <div>
                <h2 className="text-[20px] font-black text-[#111111]">
                  {activeScenario.title}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#4A4D45] font-medium">
                  {activeScenario.description}
                </p>
              </div>

              {/* Feedback toast from previous choice */}
              {lastFeedback && (
                <div className="flex items-center gap-2.5 rounded-2xl bg-[#F3F9D2] p-3.5 text-[12px] font-bold text-[#111111] animate-in fade-in duration-200">
                  <CheckCircle2 className="size-4 text-[#7B9E00] shrink-0" />
                  <span>{lastFeedback}</span>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 pt-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#6B6F66]">
                  Выберите ваше решение:
                </p>
                {activeScenario.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionSelect(opt)}
                    className="group flex w-full items-center justify-between rounded-[20px] border border-[#E5E5E0] bg-white p-4 text-left font-extrabold text-[#111111] transition-all hover:border-[#B3DB00] hover:bg-[#EBF7B6]/40 hover:scale-[1.01] hover:shadow-md cursor-pointer"
                  >
                    <span className="text-[13px] leading-snug">{opt.text}</span>
                    <span className="ml-3 grid size-8 shrink-0 place-items-center rounded-full bg-[#F4F4F0] group-hover:bg-[#B3DB00] group-hover:text-[#111111] transition-colors">
                      <ArrowRight className="size-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Simulation Completed Card */
            <div className="surface-card p-8 text-center space-y-5 bg-gradient-to-br from-[#F3F9D2] via-white to-[#EAF6B0]">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#111111] text-[#B3DB00] shadow-xl">
                <Trophy className="size-10 stroke-[2.2]" />
              </div>

              <div>
                <h2 className="text-[24px] font-black text-[#111111]">
                  Симуляция 6 месяцев успешно завершена! 🎉
                </h2>
                <p className="mt-2 text-[13px] font-medium text-[#4A4E44] max-w-md mx-auto">
                  Вы прожили 180 дней виртуального быта. Прогнозируемая гармония совместной жизни составляет{" "}
                  <strong className="text-[#111111]">{scores.overallCompatibility}%</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-5 text-[12.5px] font-black text-[#111111] shadow-sm hover:bg-[#F4F4F0] cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                  Пройти снова
                </button>

                <Link
                  href="/app/housing"
                  className="lime-button inline-flex h-11 items-center gap-2 rounded-full px-6 text-[12.5px] font-black shadow-md hover:scale-105 transition-transform"
                >
                  Перейти к поиску жилья
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          )}

          {/* Timeline of Simulated Incidents */}
          <div className="surface-card p-6 space-y-4">
            <h3 className="text-[16px] font-black text-[#111111] flex items-center gap-2">
              <Sparkles className="size-4 text-[#7B9E00]" />
              Таймлайн прогнозируемых точек быта (90 дней)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-[#E5E5E0]">
                <span className="rounded-full bg-[#EBF7B6] px-2.5 py-1 text-[10px] font-black text-[#7B9E00]">
                  День 14
                </span>
                <span className="text-[12.5px] font-bold text-[#111111]">
                  Экзаменационный период × Громкие мероприятия
                </span>
                <span className="ml-auto text-[10.5px] font-extrabold text-[#7B9E00]">
                  Решено ✅
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-[#E5E5E0]">
                <span className="rounded-full bg-[#EBF7B6] px-2.5 py-1 text-[10px] font-black text-[#7B9E00]">
                  День 65
                </span>
                <span className="text-[12.5px] font-bold text-[#111111]">
                  Бытовой форс-мажор (Ремонт техники)
                </span>
                <span className="ml-auto text-[10.5px] font-extrabold text-[#7B9E00]">
                  Застраховано 🛡️
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Living DNA Analytics & Smart Agreement Builder */}
        <div className="lg:col-span-5 space-y-6">
          <LivingDNACard scores={scores} />

          {/* Smart Living Agreement Generator Box */}
          <div className="surface-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#7B9E00]" />
                <h3 className="text-[15px] font-black text-[#111111]">
                  Умный Договор Быта
                </h3>
              </div>
              <span className="rounded-full bg-[#B3DB00] px-2 py-0.5 text-[9.5px] font-black text-[#111111]">
                AUTO-GEN
              </span>
            </div>

            <p className="text-[11.5px] font-medium text-[#6B6F66]">
              Правила автоматически сформированы на основе ваших ответов в симуляторе:
            </p>

            <div className="space-y-2">
              {agreements.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 rounded-xl bg-white p-3 text-[12px] font-bold text-[#111111] border border-[#E5E5E0]"
                >
                  <CheckCircle2 className="size-4 text-[#7B9E00] shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={copyAgreement}
              className="lime-button flex h-10 w-full items-center justify-center gap-2 rounded-full text-[12px] font-black shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-4" /> Скопировано в буфер!
                </>
              ) : (
                <>
                  <Copy className="size-4" /> Скопировать Умный Договор
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
