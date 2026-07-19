import Link from "next/link";
import { ArrowLeft, Minus, Sparkles } from "lucide-react";
import { getRepository } from "@/lib/repositories/server";
import { formatRubles } from "@/data/demo";
import { PageFrame } from "@/components/tenant/page-frame";

export default async function ComparePage() {
  const repo = getRepository();
  const roommates = await repo.listRoommates();
  const compareList = roommates.slice(0, 3);

  const getSleepSchedule = (id: string) => {
    const schedules: Record<string, string> = {
      maria: "Гибкий",
      artem: "Сова",
      ekaterina: "Жаворонок",
      ilya: "Сова"
    };
    return schedules[id] || "Гибкий";
  };

  const getGuestsFrequency = (id: string) => {
    const guests: Record<string, string> = {
      maria: "Редко",
      artem: "Никогда",
      ekaterina: "Иногда",
      ilya: "Никогда"
    };
    return guests[id] || "Иногда";
  };

  const getPetsStatus = (id: string) => {
    const pets: Record<string, string> = {
      maria: "Без питомцев",
      artem: "Без питомцев",
      ekaterina: "Есть кошка",
      ilya: "Без питомцев"
    };
    return pets[id] || "Без питомцев";
  };

  const rows = [
    ["Бюджет", ...compareList.map((p) => formatRubles(p.budget))],
    ["Район", ...compareList.map((p) => p.district)],
    ["Режим сна", ...compareList.map((p) => getSleepSchedule(p.id))],
    ["Частота гостей", ...compareList.map((p) => getGuestsFrequency(p.id))],
    ["Домашние животные", ...compareList.map((p) => getPetsStatus(p.id))],
    ["Совместимость", ...compareList.map((p) => `${p.compatibility}%`)],
  ];

  // Generate comparison feedback dynamically
  let discussionPoints = "Уточните предпочтения по району и бюджету.";
  if (compareList.length >= 2) {
    const conflicts: string[] = [];
    const p1 = compareList[0];
    const p2 = compareList[1];
    
    const sleep1 = getSleepSchedule(p1.id);
    const sleep2 = getSleepSchedule(p2.id);
    if (sleep1 !== sleep2 && (sleep1 === "Жаворонок" || sleep2 === "Жаворонок") && (sleep1 === "Сова" || sleep2 === "Сова")) {
      conflicts.push(`у ${p1.name} и ${p2.name} не совпадает режим сна (${sleep1} и ${sleep2}) — обсудите тихие часы`);
    }

    const pets1 = getPetsStatus(p1.id);
    const pets2 = getPetsStatus(p2.id);
    if (pets1.includes("Есть") || pets2.includes("Есть")) {
      conflicts.push(`согласуйте проживание с домашними животными (${pets1} и ${pets2})`);
    }

    if (p1.district !== p2.district) {
      conflicts.push(`различаются предпочтения по району (${p1.district} и ${p2.district}) — уточните гибкость географии`);
    }

    if (conflicts.length > 0) {
      discussionPoints = `Обратите внимание: ${conflicts.join("; ") + "."}`;
    } else {
      discussionPoints = `Отличный союз! У ${p1.name} и ${p2.name} совпадают ключевые привычки и бюджет. Можно планировать совместные просмотры.`;
    }
  }

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
              <span key={person.id} className="text-black">
                {person.name}, {person.age}
              </span>
            ))}
          </div>
          {rows.map(([label, ...values]) => (
            <div
              key={label}
              className={`grid grid-cols-[190px_repeat(${compareList.length},1fr)] items-center border-b p-4 text-sm last:border-0`}
            >
              <span className="font-bold text-black">{label}</span>
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
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="font-extrabold text-black">Что обсудить</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {discussionPoints}
          </p>
          <Link
            href={`/app/assistant?q=${encodeURIComponent("Мы сравниваем сожителей: " + discussionPoints + " Посоветуй, как нам договориться и прийти к компромиссу.")}`}
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
