"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { compatibilityQuestions } from "@/lib/compatibility/questions";
import { createClientRepository } from "@/lib/repositories";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const choices: Record<string, string[]> = {
  budget: ["До 20 000 ₽", "20 000–30 000 ₽", "30 000–45 000 ₽"], districts: ["Центр", "Фестивальный", "Юбилейный", "Готов рассмотреть любой"], moveInDate: ["В течение месяца", "Через 1–3 месяца", "Пока изучаю варианты"], leaseMonths: ["3–6 месяцев", "6–12 месяцев", "От года"], sleep: ["Рано ложусь", "Поздно ложусь", "Гибкий режим"], noise: ["Люблю тишину", "Умеренный фон", "Шум не мешает"], guests: ["Почти никогда", "Иногда", "Часто"], parties: ["Не люблю", "Иногда можно", "Люблю"], smoking: ["Не курю", "Иногда", "Курю"], alcohol: ["Не пью дома", "Иногда", "Спокойно отношусь"], pets: ["Нет животных", "Есть кошка", "Есть собака"], petTolerance: ["Только кошки", "Только собаки", "Готов(а) к любым", "Против животных"], cleanliness: ["Главное — чтобы было чисто", "Умеренный порядок", "Порядок не важен"], cooking: ["Почти не готовлю", "Несколько раз в неделю", "Готовлю часто"], sharedProducts: ["Да, удобно делить", "Только по договорённости", "Предпочитаю отдельно"], remoteWork: ["Не работаю дома", "Иногда", "Почти всегда"], temperature: ["Прохладно", "Средняя", "Тепло"], privateSpace: ["Очень важно", "В меру", "Люблю общение"], commonZones: ["Тихие общие зоны", "По-разному", "Много времени вместе"], sociability: ["Мне нужно уединение", "Баланс", "Люблю компанию"], leisure: ["Кино и книги", "Спорт и прогулки", "Игры и встречи"],
};

export function CompatibilityWizard() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const question = compatibilityQuestions[step];
  const options = choices[question.key] ?? ["Да", "Иногда", "Нет"];
  const progress = Math.round(((step + 1) / compatibilityQuestions.length) * 100);
  const choose = async (answer: string) => {
    setAnswers((current) => ({ ...current, [question.key]: answer }));
    await createClientRepository().saveAnswer({ questionKey: question.key, answer, importance: 3 });
    setSaved(false);
    window.setTimeout(() => {
      if (step < compatibilityQuestions.length - 1) setStep((current) => current + 1);
      else setSaved(true);
    }, reduceMotion ? 0 : 180);
  };
  const summary = useMemo(() => Object.keys(answers).length, [answers]);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="surface-card relative min-h-[520px] overflow-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#EAF8AD]/60 blur-3xl" />
        <div className="relative flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>Вопрос {step + 1} из {compatibilityQuestions.length}</span><span>{progress}%</span>
        </div>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
          <motion.div className="h-full rounded-full bg-[hsl(var(--accent))]" animate={{ width: `${progress}%` }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.key}
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <p className="mt-10 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7B9E00]">{question.category}</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-black tracking-[-0.035em] sm:text-[30px]">{question.label}</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {options.map((option, index) => {
                const selected = answers[question.key] === option;
                return (
                  <motion.button
                    type="button"
                    key={option}
                    onClick={() => void choose(option)}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    className={`flex min-h-16 items-center justify-between rounded-[17px] border px-4 text-left text-sm font-bold transition-colors ${selected ? "border-[#8EAD00] bg-[#EBF7B6]" : "bg-white hover:border-[#B3DB00] hover:bg-[#F8FBEA]"}`}
                  >
                    <span>{option}</span>
                    <span className={`grid size-6 place-items-center rounded-full border transition ${selected ? "border-[#B3DB00] bg-[#B3DB00]" : "bg-white"}`}>{selected ? <Check className="size-3.5" /> : null}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-8 flex items-center justify-between border-t pt-5">
          <button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="pressable inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-extrabold disabled:opacity-40"><ArrowLeft className="size-4" /> Назад</button>
          {step < compatibilityQuestions.length - 1 ? <button type="button" onClick={() => setStep((current) => current + 1)} className="pressable inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-extrabold text-background">Пропустить <ArrowRight className="size-4" /></button> : null}
        </div>
      </section>

      <aside className="space-y-4">
        <motion.div whileHover={reduceMotion ? undefined : { y: -3 }} className="relative overflow-hidden rounded-[20px] bg-foreground p-5 text-background">
          <div className="absolute -right-8 -top-8 size-28 rounded-full bg-[#B3DB00]/15 blur-2xl" />
          <Sparkles className="relative size-5 text-[hsl(var(--accent))]" />
          <p className="relative mt-4 text-sm font-extrabold">Зачем это нужно</p>
          <p className="relative mt-2 text-xs leading-5 text-background/65">Чем точнее ответы, тем понятнее будут совпадения и спорные места в будущей группе.</p>
        </motion.div>
        <div className="surface-card p-5">
          <p className="text-xs font-extrabold">Заполнено</p>
          <p className="mt-2 text-3xl font-extrabold text-[#7B9E00]">{summary} / {compatibilityQuestions.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Ответы сохраняются автоматически.</p>
          <div className="mt-4 grid grid-cols-10 gap-1">{compatibilityQuestions.map((item, index) => <span key={item.key} className={`h-1.5 rounded-full transition-colors ${index < summary ? "bg-[#B3DB00]" : "bg-[#E9EAE5]"}`} />)}</div>
          {saved ? <motion.p initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 rounded-[12px] bg-[hsl(var(--accent-soft))] p-3 text-xs font-bold">Анкета готова — профиль обновлён.</motion.p> : null}
        </div>
      </aside>
    </div>
  );
}
