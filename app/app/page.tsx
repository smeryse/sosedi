import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Heart,
  Home,
  Search,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MediaImage } from "@/components/ui/media-image";
import { CityMap } from "@/components/map/city-map";
import { demoProperties, demoRoommates, formatRubles } from "@/data/demo";

const quickActions = [
  { label: "Найти соседей", href: "/app/roommates", icon: Search, featured: true },
  { label: "Найти жильё", href: "/app/housing", icon: Home },
  { label: "Моя группа", href: "/app/group", icon: UsersRound },
  { label: "Рассчитать бюджет", href: "/app/budget", icon: WalletCards },
];

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="text-[15px] font-extrabold tracking-[-0.025em]">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#777871] hover:text-[#111111]">
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
      <div className="grid min-h-[268px] overflow-hidden rounded-[22px] bg-white shadow-[inset_0_0_0_1px_#E5E5E0] md:grid-cols-[174px_minmax(0,1fr)]">
        <div className="hidden border-r border-[#E5E5E0] p-4 md:block">
          <div className="space-y-3.5">
            {districts.map(([name, price], index) => (
              <Link key={name} href="/app/housing" className="group block">
                <p className="flex items-center gap-2 text-[11px] font-bold">
                  {index === 0 ? <span className="h-5 w-0.5 rounded-full bg-[hsl(var(--accent))]" /> : null}
                  {name}
                </p>
                <p className="mt-0.5 pl-2.5 text-[9px] text-[#777871] group-hover:text-[#111111]">{price}</p>
              </Link>
            ))}
          </div>
          <Link href="/app/housing" className="mt-4 inline-flex rounded-full bg-[#F4F4F0] px-3 py-2 text-[9px] font-bold">
            Все районы
          </Link>
        </div>
        <CityMap className="min-h-[268px]" />
      </div>
    </section>
  );
}

function DashboardPropertyCard({ property }: { property: (typeof demoProperties)[number] }) {
  return (
    <Link href={`/app/housing/${property.id}`} className="group min-w-[190px] overflow-hidden rounded-[18px] bg-white shadow-[inset_0_0_0_1px_#E5E5E0]">
      <div className="relative h-[112px] overflow-hidden">
        <MediaImage src={property.image} alt={property.title} sizes="220px" className="object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
        <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/95"><Heart className="size-3.5" /></span>
        <span className="absolute bottom-2 left-2 rounded-full bg-[#111111] px-2 py-1 text-[8px] font-bold text-white">{property.match}% группе</span>
      </div>
      <div className="p-3">
        <p className="text-[12px] font-extrabold">{formatRubles(property.price)} <span className="font-medium text-[#777871]">/ мес.</span></p>
        <p className="mt-1 truncate text-[10px] font-bold">{property.title}</p>
        <p className="mt-1 text-[9px] text-[#777871]">{property.district} · {property.rooms} комн. · {property.area} м²</p>
      </div>
    </Link>
  );
}

export default function TenantDashboardPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <section className="flex min-h-[72px] items-end justify-between gap-5">
          <div>
            <h1 className="text-[clamp(1.75rem,2.5vw,2.35rem)] font-extrabold leading-none tracking-[-0.05em]">Доброе утро, Анна!</h1>
            <p className="mt-2 text-[12px] leading-5 text-[#73746D]">Продолжайте поиск жилья и людей, с которыми вам будет по-настоящему удобно.</p>
          </div>
          <Link href="/app/compatibility" className="hidden items-center gap-1 text-[10px] font-bold text-[#83A300] sm:inline-flex">
            Профиль заполнен на 82% <ChevronRight className="size-3.5" />
          </Link>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex min-h-[104px] flex-col justify-between rounded-[20px] p-4 transition-transform duration-150 hover:-translate-y-0.5 ${
                  action.featured ? "bg-[hsl(var(--accent))]" : "bg-white shadow-[inset_0_0_0_1px_#E5E5E0]"
                }`}
              >
                <Icon className="size-5 stroke-[1.7]" />
                <span className="flex items-end justify-between gap-3 text-[12px] font-extrabold leading-4">
                  {action.label}<ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </section>

        <DashboardMap />

        <section>
          <SectionHeading title="Рекомендуем для вас" href="/app/housing" />
          <div className="soft-scrollbar grid auto-cols-[minmax(190px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-1 xl:grid-flow-row xl:grid-cols-4 xl:overflow-visible">
            {demoProperties.map((property) => <DashboardPropertyCard key={property.id} property={property} />)}
          </div>
        </section>
      </div>

      <aside className="space-y-3.5">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-extrabold">Ваша совместимость</h2>
            <Link href="/app/compatibility" className="text-[9px] font-semibold text-[#777871]">Подробнее</Link>
          </div>
          <p className="mt-5 text-[10px] font-bold">Вы и Мария совместимы на</p>
          <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.055em] text-[#8FB000]">93%</p>
          <p className="mt-2 text-[9px] text-[#777871]">Отличный результат для совместной аренды</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#ECEDE8]"><div className="h-full w-[93%] rounded-full bg-[hsl(var(--accent))]" /></div>
          <div className="mt-5 space-y-3">
            {[["Образ жизни", 94], ["Чистота", 90], ["Режим дня", 88], ["Бюджет", 91]].map(([label, score]) => (
              <div key={label} className="grid grid-cols-[1fr_74px_27px] items-center gap-2 text-[9px]">
                <span>{label}</span>
                <span className="h-1 rounded-full bg-[#ECEDE8]"><span className="block h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${score}%` }} /></span>
                <span className="text-right font-bold">{score}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between"><h2 className="text-[13px] font-extrabold">AI-помощник</h2><span className="rounded-full bg-[#F0F1EC] px-2 py-1 text-[8px] font-bold">BETA</span></div>
          <div className="mt-4 flex gap-3 rounded-[16px] bg-[#F4F4F0] p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent))]"><Bot className="size-4" /></span>
            <p className="text-[9px] leading-[15px] text-[#686A62]">Бюджет и районы совпали с тремя кандидатами. Начните с Марии.</p>
          </div>
          <Link href="/app/assistant" className="mt-3 flex h-9 items-center justify-between rounded-full bg-[#F4F4F0] px-4 text-[9px] font-bold">Задать вопрос <ArrowRight className="size-3.5" /></Link>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between"><h2 className="text-[13px] font-extrabold">Моя группа</h2><Link href="/app/group" className="text-[9px] font-semibold text-[#777871]">Открыть</Link></div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              {demoRoommates.slice(0, 3).map((person) => <AvatarImage key={person.id} src={person.image} name={person.name} size={34} className="ring-2 ring-white" />)}
            </div>
            <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-extrabold">Квартира в центре</p><p className="mt-0.5 text-[8px] text-[#777871]">3 участника · готова на 76%</p></div>
            <ChevronRight className="size-3.5" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#E5E5E0] pt-3">
            <div><p className="text-[8px] text-[#777871]">Общий бюджет</p><p className="mt-1 text-[12px] font-extrabold">90 000 ₽</p></div>
            <div><p className="text-[8px] text-[#777871]">Совместимость</p><p className="mt-1 text-[12px] font-extrabold text-[#8FB000]">89%</p></div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between"><h2 className="text-[13px] font-extrabold">Последние сообщения</h2><Link href="/app/messages" className="text-[9px] font-semibold text-[#777871]">Все чаты</Link></div>
          <div className="mt-4 space-y-3">
            {demoRoommates.slice(1, 3).map((person, index) => (
              <Link key={person.id} href={`/app/messages/${person.id}`} className="flex items-center gap-2.5">
                <AvatarImage src={person.image} name={person.name} size={30} />
                <span className="min-w-0 flex-1"><span className="block text-[9px] font-extrabold">{person.name}</span><span className="block truncate text-[8px] text-[#777871]">{index ? "Когда сможем посмотреть жильё?" : "Давайте обсудим районы"}</span></span>
                <span className="grid size-4 place-items-center rounded-full bg-[hsl(var(--accent))] text-[8px] font-extrabold">{index + 1}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-[#E5E5E0] pt-3 text-[8px] text-[#777871]"><Check className="size-3 text-[#8FB000]" /> 1 заявка ждёт ответа группы</div>
        </section>
      </aside>
    </div>
  );
}
