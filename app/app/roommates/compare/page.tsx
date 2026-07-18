import Link from "next/link";
import { ArrowLeft, Check, Minus, Sparkles } from "lucide-react";
import { getRepository } from "@/lib/repositories";
import { formatRubles } from "@/data/demo";
import { PageFrame } from "@/components/tenant/page-frame";

export default async function ComparePage() {
  const repo = getRepository();
  const roommates = await repo.listRoommates();
  const compareList = roommates.slice(0, 3);

  // Build comparison rows dynamically
  const rows = compareList.length >= 3
    ? [
        ["Бюджет", ...compareList.map((p) => formatRubles(p.budget))],
        ["Район", ...compareList.map((p) => p.district)],
        ["Режим", ...compareList.map((p) => p.traits.find((t) => t.includes("ранний") || t.includes("Ранний") || t.includes("Гибкий") || t.includes("гибкий")) || "Гибкий")],
        ["Гости", ...compareList.map(() => "Редко")],
        ["Совместимость", ...compareList.map((p) => `${p.compatibility}%`)],
      ]
    : [
        ["Бюджет", ...compareList.map((p) => formatRubles(p.budget))],
        ["Совместимость", ...compareList.map((p) => `${p.compatibility}%`)],
      ];

  return (
    <PageFrame
      backHref="/app/roommates"
      title="Сравнение соседей"
      description="Смотрите важные различия рядом и выбирайте тех, с кем проще договориться."
    >
      <div className="overflow-x-auto rounded-[22px] border bg-surface">
        <div className="min-w-[680px]">
          <div className={`grid grid-cols-[190px_repeat(${compareList.length},1fr)] border-b bg-surface-muted p-4 text-xs font-extrabold`}>
            <span>Критерий</span>
            {compareList.map((person) => (
              <span key={person.id}>
                {person.name}, {person.age}
              </span>
            ))}
          </div>
          {rows.map(([label, ...values]) => (
            <div
              key={label}
              className={`grid grid-cols-[190px_repeat(${compareList.length},1fr)] items-center border-b p-4 text-sm last:border-0`}
            >
              <span className="font-bold">{label}</span>
              {values.map((value, index) => (
                <span
                  key={`${label}-${index}`}
                  className={
                    label === "Совместимость"
                      ? "font-extrabold text-[hsl(var(--accent-hover))]"
                      : "text-muted-foreground"
                  }
                >
                  {label === "Совместимость" ? (
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="size-3" /> {value}
                    </span>
                  ) : (
                    value
                  )}
                  {label === "Режим" && index === 1 ? (
                    <Check className="ml-1 inline size-3 text-[hsl(var(--accent-hover))]" />
                  ) : null}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="font-extrabold">Что обсудить</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {compareList.length >= 2
              ? `У ${compareList[0].name} и ${compareList[1].name} могут различаться предпочтения по району. Сначала уточните, насколько гибкая география.`
              : "Уточните предпочтения по району и бюджету."}
          </p>
          <Link
            href="/app/assistant"
            className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold"
          >
            Спросить AI-помощника →
          </Link>
        </div>
        <div className="surface-card p-5">
          <h2 className="font-extrabold">Решили?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Пригласите соседа в группу, чтобы вместе откликаться на квартиры.
          </p>
          <Link
            href="/app/group"
            className="lime-button mt-4 inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold"
          >
            <ArrowLeft className="size-4 rotate-180" /> Открыть группу
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Minus className="size-3" /> Данные обновляются на основании вашей анкеты.
      </div>
    </PageFrame>
  );
}
