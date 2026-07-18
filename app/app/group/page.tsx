import Link from "next/link";
import { ArrowRight, Check, Copy, Mail, Plus, Sparkles, UserPlus, UsersRound } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { getRepository } from "@/lib/repositories";
import { formatRubles } from "@/data/demo";

export default async function GroupPage() {
  const repo = getRepository();
  const state = await repo.getState();
  const group = state.group;

  const roommates = await repo.listRoommates();
  // Get members belonging to this group
  const groupMembers = group
    ? roommates.filter((r) => group.memberIds.includes(r.id))
    : [];

  const displayMembers = group ? groupMembers : roommates.slice(0, 3);
  const groupName = group ? group.name : "Квартира в центре";
  const targetBudget = group ? group.targetBudget : 90000;
  const moveInDate = group ? group.moveInDate : "2026-08-15";
  const compatibility = group ? group.compatibility : 89;

  return (
    <PageFrame
      eyebrow="Команда"
      title="Моя группа"
      description="Соберите людей, которым подойдёт один дом, и подайте общую заявку."
      actions={
        !group && (
          <Link
            href="/app/group/create"
            className="lime-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold"
          >
            <Plus className="size-4" /> Создать группу
          </Link>
        )
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[hsl(var(--accent-hover))]">
                  {group ? "Группа готова к заявке" : "Демонстрационная группа"}
                </p>
                <h2 className="mt-2 text-xl font-extrabold">{groupName}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Переезд {moveInDate} · бюджет {formatRubles(targetBudget)} / мес.
                </p>
              </div>
              <span className="rounded-full bg-[hsl(var(--accent-soft))] px-3 py-1.5 text-[10px] font-extrabold">
                {displayMembers.length} участников
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {displayMembers.map((person) => (
                <div key={person.id} className="rounded-[16px] bg-surface-muted p-3">
                  <div className="flex items-center gap-2">
                    <div className="grid size-9 place-items-center rounded-full bg-[hsl(var(--accent))] text-xs font-extrabold">
                      {person.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold">{person.name}</p>
                      <p className="text-[10px] text-muted-foreground">{person.compatibility}% match</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground">{person.traits[0]}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-extrabold"
              >
                <UserPlus className="size-4" /> Пригласить
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-extrabold"
              >
                <Copy className="size-4" /> Скопировать ссылку
              </button>
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[hsl(var(--accent-hover))]" />
              <h2 className="font-extrabold">Совместимость группы — {compatibility}%</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Команда хорошо совпадает по бюджету, режиму и отношению к порядку. Обсудите шум после 23:00 и правила гостей.
            </p>
            <Link href="/app/compatibility" className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold">
              Открыть разбор <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="surface-card p-5">
            <h2 className="font-extrabold">Следующий шаг</h2>
            <div className="mt-4 space-y-3">
              {[
                ["Заполнить данные группы", !!group],
                ["Добавить четвёртого участника", false],
                ["Выбрать жильё", false],
                ["Отправить заявку", false],
              ].map(([label, done]) => (
                <div key={label as string} className="flex items-center gap-2 text-xs">
                  <span
                    className={`grid size-5 place-items-center rounded-full ${
                      done ? "bg-[hsl(var(--accent))]" : "border"
                    }`}
                  >
                    {done ? <Check className="size-3" /> : null}
                  </span>
                  <span className={done ? "font-bold" : "text-muted-foreground"}>{label as string}</span>
                </div>
              ))}
            </div>
          </section>

          <Link
            href="/app/messages"
            className="flex items-center justify-center gap-2 rounded-full border bg-surface px-4 py-3 text-xs font-extrabold"
          >
            <Mail className="size-4" /> Чат группы
          </Link>

          <div className="rounded-[18px] bg-foreground p-5 text-background">
            <UsersRound className="size-5 text-[hsl(var(--accent))]" />
            <p className="mt-4 text-sm font-extrabold">Правила группы</p>
            <p className="mt-2 text-xs leading-5 text-background/65">
              Обсуждайте решения в чате. Заявку может отправить только создатель группы.
            </p>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}
