import Image from "next/image";
import Link from "next/link";
import { Check, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { getRepository } from "@/lib/repositories";
import { formatRubles } from "@/data/demo";
import { PageFrame } from "@/components/tenant/page-frame";
import { notFound } from "next/navigation";

export default async function RoommateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepository();
  const roommates = await repo.listRoommates();
  const person = roommates.find((item) => item.id === id);
  if (!person) notFound();

  return (
    <PageFrame
      backHref="/app/roommates"
      backLabel="К поиску соседей"
      title={`${person.name}, ${person.age}`}
      description={`${person.job} · ищет спокойный дом и соседей на длительный срок.`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[24px] border bg-surface">
            <div className="relative h-[330px] sm:h-[420px]">
              <Image
                src={person.image}
                alt={`${person.name}, ${person.age} лет`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Бюджет</p>
                <p className="mt-1 font-extrabold">{formatRubles(person.budget)}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Район</p>
                <p className="mt-1 font-extrabold">{person.district}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Переезд</p>
                <p className="mt-1 font-extrabold">Август 2026</p>
              </div>
            </div>
          </div>

          <section className="surface-card p-5">
            <h2 className="text-base font-extrabold">О человеке</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Любит порядок без фанатизма, уважает личное пространство и заранее договаривается о правилах дома. По вечерам — прогулка, книга или тихий фильм.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {person.traits.map((trait) => (
                <span key={trait} className="rounded-full bg-surface-muted px-3 py-2 text-xs font-bold">
                  {trait}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="surface-card p-5">
            <div className="flex items-center gap-2 text-[hsl(var(--accent-hover))]">
              <Sparkles className="size-5" />
              <span className="text-xs font-extrabold uppercase tracking-[0.1em]">Совместимость</span>
            </div>
            <p className="mt-3 text-5xl font-extrabold tracking-[-0.06em]">{person.compatibility}%</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Высокое совпадение по ритму жизни, бюджету и отношению к дому.
            </p>
            <div className="mt-5 space-y-3">
              {[
                ["Бюджет", 96],
                ["Режим дня", 93],
                ["Чистота", 91],
                ["Общие зоны", 88],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[1fr_42px] items-center gap-3 text-xs">
                  <span>{label}</span>
                  <span className="text-right font-extrabold">{value}%</span>
                  <span className="col-span-2 -mt-2 h-1.5 rounded-full bg-surface-muted">
                    <span
                      className="block h-full rounded-full bg-[hsl(var(--accent))]"
                      style={{ width: `${value}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </section>

          <Link
            href={`/app/messages/${person.id}`}
            className="lime-button flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold"
          >
            <MessageCircle className="size-4" /> Написать сообщение
          </Link>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border bg-surface px-4 py-3 text-xs font-extrabold"
          >
            <ShieldCheck className="size-4" /> Пригласить в группу
          </button>

          <div className="rounded-[18px] border bg-surface p-4 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <Check className="size-4 shrink-0 text-[hsl(var(--accent-hover))]" />
              <span>Профиль подтверждён по email и телефону.</span>
            </div>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}
