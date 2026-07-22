import Link from "next/link";
import { ArrowRight, Building2, Check, Eye, MessageCircle, Plus, TrendingUp, UsersRound } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { getRepository } from "@/lib/repositories/server";
import { getCurrentUser } from "@/lib/auth/session";
import { formatRubles } from "@/data/demo";

export default async function OwnerDashboardPage() {
  const user = await getCurrentUser();
  const repo = getRepository();
  const properties = await repo.listProperties();

  return (
    <PageFrame
      title={`Добрый день, ${user?.displayName ?? "друг"}`}
      description="Здесь вы видите объекты, отклики и следующие шаги по каждой заявке."
      actions={
        <Link href="/owner/properties/new" className="lime-button inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold">
          <Plus className="size-4" /> Добавить объект
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        {([
          ["Активные объекты", "3", Building2],
          ["Новые заявки", "8", UsersRound],
          ["Просмотры за месяц", "142", Eye],
          ["Средний срок ответа", "2 ч", TrendingUp],
        ] as [string, string, typeof Building2][]).map(([label, value, Icon]) => (
          <div key={label} className="surface-card p-4">
            <Icon className="size-5 text-[hsl(var(--accent-hover))]" />
            <p className="mt-4 text-2xl font-extrabold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">Последние заявки</h2>
            <Link href="/owner/applications" className="text-xs font-bold text-muted-foreground">Все заявки</Link>
          </div>
          <div className="mt-4 divide-y">
            {[
              ["Мария и группа из 3 человек", "Светлая квартира в центре", "Новая", "Сегодня, 10:30"],
              ["Илья и Екатерина", "Квартира рядом с парком", "На просмотре", "Вчера"],
              ["Артём", "Комната у Галицкого парка", "Одобрена", "12 мая"],
            ].map(([name, property, status, date]) => (
              <Link href="/owner/applications" key={name} className="flex items-center gap-3 py-3">
                <div className="grid size-9 place-items-center rounded-full bg-surface-muted text-xs font-extrabold">
                  {name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{name}</p>
                  <p className="mt-1 truncate text-[10px] text-muted-foreground">{property} · {date}</p>
                </div>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold">{status}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[20px] bg-[hsl(var(--accent))] p-5">
            <p className="text-sm font-extrabold">Рейтинг объектов</p>
            <p className="mt-3 text-4xl font-extrabold">4,9</p>
            <p className="mt-1 text-xs text-foreground/70">Средняя оценка гостей</p>
            <Link href="/owner/analytics" className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold">
              Открыть аналитику <ArrowRight className="size-4" />
            </Link>
          </section>
          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4" />
              <h2 className="text-sm font-extrabold">Быстрый ответ</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Ответьте на 3 заявки сегодня, чтобы сохранить приоритет в выдаче.
            </p>
          </section>
        </aside>
      </div>

      <section>
        <h2 className="mb-3 text-base font-extrabold">Ваши объекты</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {properties.slice(0, 3).map((property) => (
            <Link key={property.id} href="/owner/properties" className="surface-card block p-4">
              <p className="text-sm font-extrabold">{property.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{property.district} · {formatRubles(property.price)}</p>
              <p className="mt-4 flex items-center gap-1 text-xs font-bold">
                <Check className="size-3 text-emerald-700" /> Опубликован
              </p>
            </Link>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
