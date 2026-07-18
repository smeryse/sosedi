import Link from "next/link";
import {
  ArrowRight,
  Home,
  Receipt,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MediaImage } from "@/components/ui/media-image";
import { CityMap } from "@/components/map/city-map";
import { demoProperties, demoRoommates, formatRubles } from "@/data/demo";

const quickActions = [
  { label: "Найти сожителей", href: "/app/roommates", icon: Search, featured: true },
  { label: "Найти жильё", href: "/app/housing", icon: Home },
  { label: "Мои группы", href: "/app/group", icon: Users },
  { label: "Калькулятор расходов", href: "/app/budget", icon: Receipt },
];

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-4">
      <h2 className="text-[16px] font-black tracking-[-0.02em] text-[#111111]">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B6F66] hover:text-[#111111]">
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
      <div className="grid min-h-[300px] overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white shadow-sm md:grid-cols-[210px_minmax(0,1fr)]">
        <div className="hidden border-r border-[#E5E5E0] p-5 md:flex md:flex-col md:justify-between">
          <div className="space-y-4">
            {districts.map(([name, price], index) => (
              <Link key={name} href="/app/housing" className="group block">
                <p className="flex items-center gap-2 text-[12px] font-black text-[#111111]">
                  {index === 0 ? <span className="size-2 rounded-full bg-[#B3DB00]" /> : <span className="size-2 rounded-full bg-transparent" />}
                  {name}
                </p>
                <p className="mt-0.5 pl-4 text-[10px] font-medium text-[#6B6F66] group-hover:text-[#111111]">{price}</p>
              </Link>
            ))}
          </div>
          <Link href="/app/housing" className="mt-6 inline-flex h-9 items-center justify-center rounded-full bg-[#F4F4F0] px-4 text-[10.5px] font-bold text-[#111111] transition-colors hover:bg-[#EBF7B6]">
            Смотреть все районы
          </Link>
        </div>
        <CityMap className="min-h-[300px] w-full" />
      </div>
    </section>
  );
}

import { HeartButton } from "@/components/favorites-context";

function DashboardPropertyCard({ property }: { property: (typeof demoProperties)[number] }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border border-[#E5E5E0] bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="relative h-[136px] overflow-hidden rounded-[16px]">
        <Link href={`/app/housing/${property.id}`}>
          <MediaImage src={property.image} alt={property.title} sizes="240px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>
        <HeartButton type="property" id={property.id} className="absolute right-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[14px] font-black text-[#111111]">{formatRubles(property.price)} <span className="text-[11px] font-normal text-[#6B6F66]">/ мес</span></p>
        <h3 className="mt-1 line-clamp-1 text-[11.5px] font-extrabold text-[#111111]">{property.title}</h3>
        <p className="mt-1 text-[10px] text-[#6B6F66]">{property.district} · {property.rooms} сожителя · {property.area} м²</p>
      </div>
    </article>
  );
}

export default function TenantDashboardPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <section className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[28px] font-black tracking-tight text-[#111111] sm:text-[34px]">
              Доброе утро, Анна! 👋
            </h1>
            <p className="mt-1 text-[13px] text-[#6B6F66] font-medium">
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
                className={`group flex min-h-[116px] flex-col justify-between rounded-[22px] p-4.5 transition-transform hover:-translate-y-0.5 ${
                  action.featured
                    ? "bg-[#B3DB00] text-[#111111] shadow-sm"
                    : "border border-[#E5E5E0] bg-white text-[#111111] shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-5 stroke-[1.8]" />
                  <ArrowRight className="size-4 opacity-70 transition-transform group-hover:translate-x-1" />
                </div>
                <span className="text-[13px] font-black leading-5">
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
            {demoProperties.slice(0, 4).map((property) => (
              <DashboardPropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </div>

      {/* Right Column Aside (Exact 1.png design) */}
      <aside className="space-y-4">
        <section className="rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-black text-[#111111]">Ваша совместимость</h2>
            <Link href="/app/compatibility" className="text-[10.5px] font-bold text-[#6B6F66] hover:text-[#111111]">Смотреть все</Link>
          </div>
          <p className="mt-4 text-[11px] font-bold text-[#6B6F66]">Вы совместимы с Марко на</p>
          <p className="mt-1 text-[38px] font-black leading-none tracking-tight text-[#7B9E00]">93%</p>
          <p className="mt-1.5 text-[10px] font-bold text-[#6B6F66]">Это отличный результат!</p>

          <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-[#F4F4F0]">
            <div className="h-full w-[93%] rounded-full bg-[#B3DB00]" />
          </div>

          <div className="mt-4.5 space-y-2.5">
            {[
              ["Образ жизни", 94],
              ["Чистота", 90],
              ["Режим дня", 88],
              ["Ценности", 92],
              ["Бюджет", 91],
            ].map(([label, score]) => (
              <div key={label as string} className="grid grid-cols-[1fr_80px_30px] items-center gap-2 text-[10px]">
                <span className="text-[#6B6F66] font-medium">{label as string}</span>
                <span className="h-1.5 rounded-full bg-[#F4F4F0]">
                  <span className="block h-full rounded-full bg-[#B3DB00]" style={{ width: `${score}%` }} />
                </span>
                <span className="text-right font-black text-[#111111]">{score}%</span>
              </div>
            ))}
          </div>

          <Link href="/app/compatibility" className="mt-5 flex h-9 w-full items-center justify-center rounded-full bg-[#F4F4F0] text-[11px] font-black text-[#111111] transition-colors hover:bg-[#EBF7B6]">
            Смотреть профиль
          </Link>
        </section>

        <section className="rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-black text-[#111111]">AI помощник</h2>
            <span className="rounded-full bg-[#F4F4F0] px-2 py-0.5 text-[9px] font-black text-[#6B6F66]">BETA</span>
          </div>
          <div className="mt-3.5 flex gap-3 rounded-[18px] bg-[#F4F4F0] p-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#B3DB00] text-[#111111]">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-black text-[#111111]">Привет! Я ваш AI-помощник.</p>
              <p className="mt-0.5 text-[10px] leading-4 text-[#6B6F66] font-medium">Спросите меня о совместимости, конфликтах, быте или поиске жилья.</p>
            </div>
          </div>
          <div className="mt-3 flex items-center rounded-full border border-[#E5E5E0] bg-white p-1 pl-3.5 shadow-sm">
            <input type="text" placeholder="Напишите свой вопрос..." className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#878881]" />
            <button type="button" aria-label="Отправить" className="grid size-8 place-items-center rounded-full bg-[#B3DB00] text-[#111111]">
              <Send className="size-3.5 stroke-[2]" />
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-black text-[#111111]">Мои группы</h2>
            <Link href="/app/group" className="text-[10.5px] font-bold text-[#6B6F66] hover:text-[#111111]">Смотреть все</Link>
          </div>
          <div className="mt-3.5 space-y-3">
            <Link href="/app/group" className="flex items-center gap-3 rounded-[18px] border border-[#E5E5E0] p-3 transition-colors hover:bg-[#F4F4F0]">
              <div className="flex -space-x-2">
                {demoRoommates.slice(0, 2).map((person) => (
                  <AvatarImage key={person.id} src={person.image} name={person.name} size={32} className="ring-2 ring-white" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-black text-[#111111]">Ищем третьего в двушку</p>
                <p className="text-[9.5px] font-medium text-[#6B6F66]">2 участника · Центр</p>
              </div>
              <span className="rounded-full bg-[#EBF7B6] px-2 py-0.5 text-[9.5px] font-black text-[#7B9E00]">
                89%
              </span>
            </Link>

            <Link href="/app/group" className="flex items-center gap-3 rounded-[18px] border border-[#E5E5E0] p-3 transition-colors hover:bg-[#F4F4F0]">
              <div className="flex -space-x-2">
                {demoRoommates.slice(2, 4).map((person) => (
                  <AvatarImage key={person.id} src={person.image} name={person.name} size={32} className="ring-2 ring-white" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-black text-[#111111]">Квартира у парка</p>
                <p className="text-[9.5px] font-medium text-[#6B6F66]">3 участника · Фестивальный</p>
              </div>
              <span className="rounded-full bg-[#EBF7B6] px-2 py-0.5 text-[9.5px] font-black text-[#7B9E00]">
                91%
              </span>
            </Link>
          </div>

          <Link href="/app/group/create" className="mt-4 flex h-9 w-full items-center justify-center rounded-full bg-[#F4F4F0] text-[11px] font-black text-[#111111] transition-colors hover:bg-[#EBF7B6]">
            Создать группу
          </Link>
        </section>
      </aside>
    </div>
  );
}
