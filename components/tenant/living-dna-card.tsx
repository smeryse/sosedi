"use client";

import { ShieldCheck, Zap, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface LivingDNAScores {
  cleanliness: number;
  sleepHarmony: number;
  financialHealth: number;
  communication: number;
  guestTolerance: number;
  overallCompatibility: number;
}

export function LivingDNACard({
  scores,
  roommateName = "Мария",
  groupName = "Квартира в центре",
}: {
  scores: LivingDNAScores;
  roommateName?: string;
  groupName?: string;
}) {
  const metrics = [
    { label: "Чистота и порядок", score: scores.cleanliness, color: "bg-[#7B9E00]" },
    { label: "Режим сна и тишина", score: scores.sleepHarmony, color: "bg-[#9FC400]" },
    { label: "Финансовая стабильность", score: scores.financialHealth, color: "bg-[#B3DB00]" },
    { label: "Стиль общения", score: scores.communication, color: "bg-[#7B9E00]" },
    { label: "Отношение к гостям", score: scores.guestTolerance, color: "bg-[#9FC400]" },
  ];

  return (
    <div className="surface-card relative overflow-hidden p-6 transition-all">
      {/* Background Accent Glow */}
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[#B3DB00]/20 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E0]/70 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF7B6] px-3 py-1 text-[11px] font-black text-[#111111]">
            <Sparkles className="size-3.5 text-[#7B9E00]" />
            Living DNA Vector
          </div>
          <h3 className="mt-2 text-[18px] font-black text-[#111111]">
            ДНК совместимости: {roommateName} × Вы
          </h3>
          <p className="text-[12px] font-semibold text-[#6B6F66]">
            Расчет на основе AI-интервью и 10 000 симуляций бытовых ситуаций
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3 rounded-[20px] bg-gradient-to-br from-[#F3F9D2] to-[#E2F594] p-3.5 border border-[#B3DB00]/60 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-[#4A4E44]">Индекс совместимости</p>
            <p className="text-[26px] font-black leading-none text-[#111111]">{scores.overallCompatibility}%</p>
          </div>
          <div className="grid size-12 place-items-center rounded-full bg-[#111111] text-[#B3DB00]">
            <ShieldCheck className="size-6" />
          </div>
        </div>
      </div>

      {/* Metric Progress Bars */}
      <div className="mt-5 space-y-3.5">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between text-[12.5px] font-bold text-[#111111]">
              <span>{m.label}</span>
              <span className="font-extrabold">{m.score}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F4F4F0]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${m.color}`}
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Risk Prediction & Recommendation Footer */}
      <div className="mt-6 rounded-[18px] bg-white/90 p-4 border border-[#E5E5E0] space-y-2">
        <div className="flex items-center gap-2 text-[12px] font-black text-[#111111]">
          <CheckCircle2 className="size-4 text-[#7B9E00]" />
          <span>Прогноз ИИ: Высокая гармония (Низкий риск бытовых конфликтов)</span>
        </div>
        <p className="text-[11.5px] font-medium leading-4 text-[#55574F]">
          💡 <strong>Совет для соглашения:</strong> Зафиксируйте правило тихих часов с 23:00 в будни и раздельный бюджет на бытовую химию. Это гарантирует 98% гармонии на 12 месяцев.
        </p>
      </div>
    </div>
  );
}
