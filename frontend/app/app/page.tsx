import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Home,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MediaImage } from "@/components/ui/media-image";
import { CityMap } from "@/components/map/city-map";
import { getRepository } from "@/lib/repositories/server";
import { getCurrentUser } from "@/lib/auth/session";
import { formatRubles, type DemoProperty } from "@/data/demo";
import { HeartButton } from "@/components/favorites-context";

const quickActions = [
  { label: "Найти сожителей", href: "/app/roommates", icon: Search, featured: true },
  { label: "Найти жильё", href: "/app/housing", icon: Home },
  { label: "Мои группы", href: "/app/group", icon: Users },
  { label: "Калькулятор расходов", href: "/app/budget", icon: Calculator },
];

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-4">
      <h2 className="text-[17px] font-black tracking-[-0.02em] text-foreground">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-muted-foreground hover:text-foreground">
        Смотреть все <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function DashboardMap() {
  const districts = [
    ["Центр", "от 28 000 ₽"],
    ["Юбилейный", "от 24 000 ₽"],
    ["Фестивальный", "от 24 000 ₽"],
    ["Панорама / Галицкий", "от 25 000 ₽"],
    ["Черёмушки", "от 20 000 ₽"],
  ];

  return (
    <section>
      <SectionHeading title="Карта Краснодара" href="/app/housing" />
      <div className="grid min-h-[310px] overflow-hidden rounded-[24px] border border-border bg-surface shadow-sm md:grid-cols-[210px_minmax(0,1fr)]">
        <div className="hidden border-r border-border p-5 md:flex md:flex-col md:justify-between">
          <div className="space-y-4">
            {districts.map(([name, price], index) => (
              <Link key={name} href="/app/housing" className="group block">
                <p className="flex items-center gap-2 text-[12.5px] font-black text-foreground">
                  {index === 0 ? <span className="size-2 rounded-full bg-accent" /> : <span className="size-2 rounded-full bg-transparent" />}
                  {name}
                </p>
                <p className="mt-0.5 pl-4 text-[10.5px] font-medium text-muted-foreground group-hover:text-foreground">{price}</p>
              </Link>
            ))}
          </div>
          <Link href="/app/housing" className="mt-6 inline-flex h-9 items-center justify-center rounded-full bg-surface-muted px-4 text-[11px] font-black text-foreground transition-colors hover:bg-accent dark:hover:text-foreground">
            Смотреть все районы
          </Link>
        </div>
        <CityMap className="min-h-[310px] w-full" />
      </div>
    </section>
  );
}

function DashboardPropertyCard({ property }: { property: DemoProperty }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border border-border bg-surface p-3 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="relative h-[138px] overflow-hidden rounded-[16px]">
        <Link href={`/app/housing/${property.id}`} className="relative block h-full w-full">
          <MediaImage src={property.image} alt={property.title} sizes="240px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>
        <HeartButton type="property" id={property.id} className="absolute right-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[14.5px] font-black text-foreground">{formatRubles(property.price)} <span className="text-[11px] font-normal text-muted-foreground">/ мес</span></p>
        <h3 className="mt-1 line-clamp-1 text-[12px] font-extrabold text-foreground">{property.title}</h3>
        <p className="mt-1 text-[10px] text-muted-foreground font-medium">{property.district} · {property.rooms} комн. · {property.area} м²</p>
      </div>
    </article>
  );
}

export default async function TenantDashboardPage() {
  const user = await getCurrentUser();
  const repo = getRepository();
  const properties = await repo.listProperties();
  const roommates = await repo.listRoommates();
  const state = await repo.getState();
  const group = state.group;

  const topRoommate = roommates[0];
  const roommateName = topRoommate ? topRoommate.name : "Марией";
  const roommateComp = topRoommate ? topRoommate.compatibility : 93;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        {/* Hero Greeting (Exact 1.png) */}
        <section className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[30px] font-black tracking-tight text-foreground sm:text-[36px]">
              Доброе утро, {user?.displayName ?? "друг"}! 👋
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground font-medium">
              Продолжайте поиск идеального жилья и людей, с которыми вам по пути.
            </p>
          </div>
        </section>

        {/* 4 Quick Actions (Exact 1.png design) */}
        <section className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex min-h-[124px] flex-col justify-between rounded-[22px] p-4 transition-transform hover:-translate-y-0.5 ${
                  action.featured
                    ? "bg-accent text-accent-foreground dark:text-foreground shadow-sm hover:brightness-105"
                    : "border border-border bg-surface text-foreground shadow-sm hover:bg-surface-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-5 stroke-[2]" />
                  <ArrowRight className="size-4 opacity-80 transition-transform group-hover:translate-x-1" />
                </div>
                <span className="text-[13.5px] font-black leading-tight">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </section>

        <DashboardMap />

        <section>
          <SectionHeading title="Рекомендуем для вас" href="/app/housing" />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {properties.slice(0, 4).map((property) => (
              <DashboardPropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </div>

      {/* Right Column Aside (Exact 1.png design) */}
      <aside className="space-y-4">
        {/* Card 1: Ваша совместимость */}
        <section className="rounded-[24px] border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-black text-foreground">Ваша совместимость</h2>
            <Link href="/app/compatibility" className="text-[10.5px] font-extrabold text-muted-foreground hover:text-foreground">Смотреть все</Link>
          </div>
          <p className="mt-4 text-[11px] font-bold text-muted-foreground">Вы совместимы с {roommateName} на</p>
          <p className="mt-1 text-[40px] font-black leading-none tracking-tight text-accent">{roommateComp}%</p>
          <p className="mt-1.5 text-[10.5px] font-extrabold text-muted-foreground">Это отличный результат!</p>

          <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-accent/20">
            <div className="h-full rounded-full bg-accent" style={{ width: `${roommateComp}%` }} />
          </div>

          <div className="mt-4.5 space-y-2.5">
            {[
              ["Образ жизни", 94],
              ["Чистота", 90],
              ["Режим дня", 88],
              ["Ценности", 92],
              ["Бюджет", 91],
            ].map(([label, score]) => (
              <div key={label as string} className="grid grid-cols-[1fr_80px_32px] items-center gap-2 text-[10.5px]">
                <span className="text-muted-foreground font-medium">{label as string}</span>
                <span className="h-1.5 rounded-full bg-surface-muted">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${score}%` }} />
                </span>
                <span className="text-right font-black text-foreground">{score}%</span>
              </div>
            ))}
          </div>

          <Link href={topRoommate ? `/app/roommates/${topRoommate.id}` : "/app/roommates"} className="mt-5 flex h-9.5 w-full items-center justify-center rounded-full bg-surface-muted text-[11.5px] font-black text-foreground transition-colors hover:bg-accent dark:hover:text-foreground">
            Смотреть профиль
          </Link>
        </section>

        {/* Card 2: AI помощник BETA */}
        <section className="rounded-[24px] border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-black text-foreground">AI ассистент</h2>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[9px] font-black text-muted-foreground">BETA</span>
          </div>
          <div className="mt-3.5 flex gap-3 rounded-[18px] bg-surface-muted p-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground dark:text-foreground">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-[11.5px] font-black text-foreground">Привет! Я ваш AI-помощник.</p>
              <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground font-medium">Спросите меня о совместимости, конфликтах, быте или поиске жилья.</p>
            </div>
          </div>
          <form action="/app/assistant" method="GET" className="mt-3 flex items-center rounded-full border border-border bg-surface p-1 pl-3.5 shadow-sm focus-within:border-accent">
            <input name="q" type="text" placeholder="Напишите свой вопрос..." className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground text-foreground" />
            <button type="submit" aria-label="Отправить" className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground dark:text-foreground cursor-pointer transition-transform hover:scale-105">
              <Send className="size-3.5 stroke-[2]" />
            </button>
          </form>
        </section>

        {/* Card 3: Мои группы */}
        <section className="rounded-[24px] border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-black text-foreground">Мои группы</h2>
            <Link href="/app/group" className="text-[10.5px] font-extrabold text-muted-foreground hover:text-foreground">Смотреть все</Link>
          </div>
          <div className="mt-3.5 space-y-3">
            {group ? (
              <Link href="/app/group" className="flex items-center gap-3 rounded-[18px] border border-border p-3 transition-colors hover:bg-surface-muted">
                <div className="flex -space-x-2">
                  {roommates.slice(0, 2).map((person) => (
                    <AvatarImage key={person.id} src={person.image} name={person.name} size={32} className="ring-2 ring-surface" />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-black text-foreground">{group.name}</p>
                  <p className="text-[9.5px] font-medium text-muted-foreground">{group.memberIds.length} участника · Краснодар</p>
                </div>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[9.5px] font-black text-accent dark:text-accent-foreground">
                  {group.compatibility}%
                </span>
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">У вас пока нет активных групп.</p>
            )}
          </div>

          <Link href="/app/group/create" className="mt-4 flex h-9.5 w-full items-center justify-center rounded-full bg-surface-muted text-[11.5px] font-black text-foreground transition-colors hover:bg-accent dark:hover:text-foreground">
            Создать группу
          </Link>
        </section>
      </aside>
    </div>
  );
}
