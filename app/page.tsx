"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Play,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { LandingHeader } from "@/components/landing-header";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MediaImage } from "@/components/ui/media-image";
import { landingMetrics, landingReviews, landingSteps } from "@/data/landing";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-white/55" : "text-black/50"}`}>
      <span className="size-2 rounded-full bg-[#D6FF3F]" />
      {children}
    </p>
  );
}

export default function LandingPage() {
  const reviewsRef = useRef<HTMLDivElement>(null);

  const scrollReviews = (direction: number) => {
    reviewsRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F4F4F2] text-[#111]">
      <a
        href="#main-content"
        className="sr-only rounded-full bg-black px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]"
      >
        Перейти к содержанию
      </a>
      <LandingHeader />

      <main id="main-content">
        <section id="about" className="relative mx-auto grid min-h-[calc(100dvh-84px)] max-w-[1440px] gap-12 px-5 pb-16 pt-8 sm:px-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-16 lg:pb-20 lg:pt-10">
          <div className="relative z-10">
            <Reveal>
              <p className="mb-7 flex items-center gap-2 text-xs font-semibold text-black/45">
                <span className="size-2 rounded-full bg-[#D6FF3F] ring-4 ring-[#D6FF3F]/25" />
                Краснодар · совместная аренда без случайностей
              </p>
            </Reveal>

            <h1 className="max-w-[760px] font-heading text-[clamp(3.25rem,7.1vw,6.65rem)] font-bold leading-[0.89] tracking-[-0.055em]">
              {["Соседи", "делают жизнь"].map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.08 + index * 0.1, ease }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
              <span className="flex items-center gap-3 overflow-hidden pb-[0.1em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.28, ease }}
                >
                  лучше
                </motion.span>
                <motion.span
                  initial={{ scale: 0, rotate: -24 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.65, delay: 0.75, ease }}
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-[#D6FF3F] sm:size-16 lg:size-[72px]"
                >
                  <ArrowRight className="size-6 stroke-[2.2] sm:size-8" />
                </motion.span>
              </span>
            </h1>

            <Reveal delay={0.35} className="mt-7 max-w-[590px]">
              <p className="max-w-[470px] text-base leading-relaxed text-black/55 sm:text-lg">
                Находим людей, жильё и правила, с которыми спокойно жить. Совпадение по привычкам, бюджету и планам — до первого просмотра.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/app/roommates" className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#0D0D0C] px-7 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#D6FF3F] hover:text-black active:translate-y-0">
                  Найти соседей
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a href="#product" className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold backdrop-blur transition hover:border-black/20 hover:bg-white">
                  <span className="grid size-8 place-items-center rounded-full bg-[#D6FF3F]">
                    <Play className="ml-0.5 size-3.5 fill-black" />
                  </span>
                  Смотреть, как работает
                </a>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {["maria", "artem", "ekaterina", "ilya"].map((id) => (
                    <AvatarImage key={id} src={`/demo/people/${id}.jpg`} name="Пользователь Соседей" size={42} className="size-10 ring-2 ring-[#F4F4F2]" />
                  ))}
                </div>
                <p className="max-w-[230px] text-xs leading-relaxed text-black/55">
                  <strong className="font-semibold text-black">12 500 человек</strong> уже нашли своих соседей
                </p>
              </div>
            </Reveal>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.28, ease }}
            className="relative mx-auto grid h-[500px] w-full max-w-[640px] grid-cols-[1.45fr_0.8fr] grid-rows-2 gap-3 sm:h-[620px] lg:h-[clamp(520px,44vw,650px)]"
          >
            <div className="group relative row-span-2 overflow-hidden rounded-[30px] bg-[#ddd] sm:rounded-[38px]">
              <MediaImage src="/demo/properties/center-loft.jpg" alt="Светлая квартира для совместной аренды" sizes="(max-width: 1024px) 70vw, 38vw" priority className="object-cover transition duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold backdrop-blur-xl">
                <MapPin className="size-3.5" /> Краснодар
              </span>
              <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/35 bg-white/88 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl sm:bottom-5 sm:left-5 sm:right-5">
                <div className="flex items-center gap-3">
                  <AvatarImage src="/demo/people/maria.jpg" name="Мария" size={44} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">Мария, 24</p>
                    <p className="truncate text-[11px] text-black/45">ищет соседей в центре</p>
                  </div>
                  <span className="rounded-full bg-[#D6FF3F] px-3 py-1.5 text-xs font-bold">96%</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[26px] bg-white sm:rounded-[32px]">
              <MediaImage src="/demo/properties/festival-flat.jpg" alt="Современная квартира в Краснодаре" sizes="250px" priority className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute bottom-3 left-3 right-3 rounded-[14px] bg-white/90 px-3 py-2 text-[10px] font-semibold leading-tight backdrop-blur-xl sm:text-xs">Жильё с проверенными документами</span>
            </div>
            <div className="grid grid-rows-[1fr_auto] gap-3">
              <div className="group relative overflow-hidden rounded-[26px] sm:rounded-[32px]">
                <MediaImage src="/demo/people/ekaterina.jpg" alt="Проверенная участница сервиса" sizes="250px" className="object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute bottom-3 left-3 right-3 rounded-[14px] bg-black/75 px-3 py-2 text-[10px] font-medium leading-tight text-white backdrop-blur sm:text-xs">Проверенные профили</span>
              </div>
              <div className="rounded-[24px] bg-[#0D0D0C] p-4 text-white sm:rounded-[28px] sm:p-5">
                <p className="text-[11px] leading-relaxed text-white/55 sm:text-xs">Совместимость по 30+ параметрам</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {["artem", "ilya", "zhenya"].map((id) => <AvatarImage key={id} src={`/demo/people/${id}.jpg`} name="Сосед" size={28} className="size-7 ring-2 ring-black" />)}
                  </div>
                  <span className="grid size-11 place-items-center rounded-full bg-[#D6FF3F] text-xs font-bold text-black">92%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section aria-label="Сервис в цифрах" className="mx-5 max-w-[1312px] rounded-[32px] bg-white px-5 py-3 sm:mx-10 lg:mx-auto lg:rounded-full lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {landingMetrics.map((metric, index) => (
              <Reveal key={metric.label} delay={index * 0.07} className={`py-6 text-center lg:py-7 ${index % 2 ? "border-l border-black/10" : ""} ${index > 1 ? "border-t border-black/10 lg:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}>
                <p className="font-heading text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{metric.value}</p>
                <p className="mt-1 text-[11px] text-black/45 sm:text-xs">{metric.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-[1440px] px-5 py-28 sm:px-10 lg:px-16 lg:py-36">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_2fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-32 lg:self-start">
              <SectionLabel>Как это работает</SectionLabel>
              <h2 className="mt-5 whitespace-pre-line font-heading text-5xl font-bold leading-[0.94] tracking-[-0.045em] sm:text-6xl">{"Просто.\nЧестно.\nПо-взрослому."}</h2>
              <p className="mt-6 max-w-[340px] text-sm leading-relaxed text-black/50">Сначала понимаем, с кем вам будет комфортно. И только потом подбираем подходящее жильё.</p>
              <Link href="/about" className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold">
                Узнать о подходе <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-3">
              {landingSteps.map((step, index) => (
                <Reveal key={step.step} delay={index * 0.1} className={index === 1 ? "sm:mt-14" : index === 2 ? "sm:mt-28" : ""}>
                  <article className="group relative min-h-[420px] overflow-hidden rounded-[30px] bg-white p-5 transition duration-500 hover:-translate-y-2 hover:shadow-[0_25px_70px_rgba(22,28,10,0.09)] sm:min-h-[460px]">
                    <span className="absolute right-5 top-5 z-10 text-xs font-semibold text-black/30">{step.step}</span>
                    <div className="relative h-[190px] overflow-hidden rounded-[21px] bg-[#E9ECE4]">
                      {step.image ? (
                        <MediaImage src={step.image} alt={step.title} sizes="320px" className="object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <>
                          <MediaImage src="/demo/people/maria.jpg" alt="Подбор совместимых соседей" sizes="320px" className="object-cover" />
                          <div className="absolute inset-0 bg-black/10" />
                          <div className="absolute bottom-4 left-4 flex -space-x-2">
                            {step.avatars?.map((id) => <AvatarImage key={id} src={`/demo/people/${id}.jpg`} name="Подходящий сосед" size={38} className="size-9 ring-2 ring-white" />)}
                          </div>
                          <span className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-[#D6FF3F] text-xs font-bold">{step.badge}</span>
                        </>
                      )}
                    </div>
                    <div className="flex min-h-[205px] flex-col justify-between px-1 pb-1 pt-7">
                      <div>
                        <h3 className="font-heading text-xl font-bold leading-tight tracking-[-0.025em]">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-black/50">{step.desc}</p>
                      </div>
                      <span className="mt-6 grid size-10 place-items-center rounded-full border border-black/10 transition group-hover:rotate-[-35deg] group-hover:bg-[#D6FF3F]">
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="relative mx-4 overflow-hidden rounded-[36px] bg-[#D6FF3F] px-6 py-12 sm:mx-8 sm:px-10 lg:min-h-[780px] lg:rounded-[52px] lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -left-24 bottom-[-20%] size-[500px] rounded-full border-[80px] border-black/[0.035]" />
          <div className="relative z-10 mx-auto grid max-w-[1320px] gap-16 lg:grid-cols-[0.72fr_1.55fr] lg:items-center">
            <Reveal>
              <SectionLabel>Наш продукт</SectionLabel>
              <h2 className="mt-6 font-heading text-6xl font-bold leading-[0.86] tracking-[-0.055em] sm:text-7xl lg:text-[88px]">Всё<br />в одном<br />месте</h2>
              <p className="mt-7 max-w-[330px] text-base leading-relaxed text-black/65">Подбор соседей, жильё, общий бюджет и бытовые дела — в одном понятном сервисе.</p>
              <div className="mt-8 space-y-3">
                {["Точные рекомендации", "Реальные объявления", "Общая группа после заселения"].map((item) => (
                  <p key={item} className="flex items-center gap-3 text-sm font-medium"><span className="grid size-6 place-items-center rounded-full bg-black text-white"><Check className="size-3.5" /></span>{item}</p>
                ))}
              </div>
              <Link href="/app" className="mt-9 inline-flex h-13 items-center gap-3 rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl">
                Открыть сервис <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>

            <Reveal delay={0.15} className="relative min-h-[520px] sm:min-h-[630px] lg:min-h-[690px]">
              <div className="absolute left-0 top-10 w-[92%] overflow-hidden rounded-[25px] border-[7px] border-black bg-[#F7F7F3] shadow-[0_35px_80px_rgba(53,64,11,0.25)] sm:top-6 lg:left-6">
                <div className="flex h-12 items-center justify-between border-b border-black/5 bg-white px-4">
                  <span className="font-heading text-sm font-bold">соседи<span className="text-[#A7CC15]">.</span></span>
                  <div className="hidden items-center gap-2 rounded-full bg-[#F4F4F2] px-3 py-2 text-[10px] text-black/40 sm:flex"><Search className="size-3" /> Найти квартиру или район</div>
                  <AvatarImage src="/demo/people/maria.jpg" name="Мария" size={28} className="size-7" />
                </div>
                <div className="grid min-h-[390px] grid-cols-[54px_1fr] bg-[#F4F4F2] sm:grid-cols-[150px_1fr] lg:min-h-[510px]">
                  <aside className="border-r border-black/5 bg-white p-3">
                    <p className="hidden px-2 text-[9px] uppercase tracking-wider text-black/30 sm:block">Меню</p>
                    <div className="mt-3 space-y-1.5">
                      {[[Home,"Главная"],[Users,"Соседи"],[Search,"Жильё"],[MessageCircle,"Сообщения"],[WalletCards,"Бюджет"]].map(([Icon,label], index) => {
                        const MenuIcon = Icon as typeof Home;
                        return <div key={String(label)} className={`flex items-center gap-2 rounded-lg p-2 text-[10px] ${index === 2 ? "bg-[#D6FF3F] font-semibold" : "text-black/45"}`}><MenuIcon className="size-3.5" /><span className="hidden sm:inline">{String(label)}</span></div>;
                      })}
                    </div>
                  </aside>
                  <div className="p-3 sm:p-5">
                    <div className="flex items-end justify-between">
                      <div><p className="text-[9px] uppercase tracking-wider text-black/35">Для вашей группы</p><h3 className="mt-1 font-heading text-lg font-bold sm:text-2xl">Квартиры в Краснодаре</h3></div>
                      <SlidersHorizontal className="size-4 text-black/40" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[{img:"center-loft.jpg",price:"38 000 ₽",name:"Двухкомнатная в центре"},{img:"festival-flat.jpg",price:"28 000 ₽",name:"Студия у парка"}].map((item) => (
                        <div key={item.name} className="overflow-hidden rounded-[16px] bg-white p-2.5">
                          <div className="relative h-24 overflow-hidden rounded-xl sm:h-36"><MediaImage src={`/demo/properties/${item.img}`} alt={item.name} sizes="280px" className="object-cover" /><span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white"><Heart className="size-3" /></span></div>
                          <p className="mt-2.5 text-xs font-bold sm:text-sm">{item.price}<span className="font-normal text-black/35"> / мес.</span></p>
                          <p className="mt-1 truncate text-[9px] text-black/45 sm:text-[11px]">{item.name}</p>
                          <div className="mt-2 flex gap-1"><span className="rounded-full bg-[#F4F4F2] px-2 py-1 text-[8px]">мебель</span><span className="rounded-full bg-[#F4F4F2] px-2 py-1 text-[8px]">Wi-Fi</span></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-[14px] bg-black p-3 text-white sm:flex sm:items-center sm:justify-between">
                      <div><p className="text-[9px] text-white/45">Бюджет группы</p><p className="mt-0.5 text-sm font-semibold">до 120 000 ₽ / мес.</p></div>
                      <div className="mt-2 flex -space-x-1.5 sm:mt-0">{["maria","artem","ilya"].map(id => <AvatarImage key={id} src={`/demo/people/${id}.jpg`} name="Участник группы" size={25} className="size-6 ring-2 ring-black" />)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div whileHover={{ y: -8, rotate: 1 }} transition={{ type: "spring", stiffness: 160, damping: 16 }} className="absolute bottom-0 right-0 w-[43%] min-w-[180px] max-w-[275px] overflow-hidden rounded-[34px] border-[7px] border-black bg-white shadow-[0_35px_70px_rgba(43,52,7,0.28)]">
                <div className="relative h-52 sm:h-64">
                  <MediaImage src="/demo/people/maria.jpg" alt="Профиль Марии" sizes="280px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-[#D6FF3F] px-2.5 py-1 text-[10px] font-bold">90% match</span>
                  <div className="absolute bottom-4 left-4 text-white"><p className="font-heading text-lg font-bold sm:text-xl">Мария, 24</p><p className="text-[10px] text-white/60">маркетолог · центр</p></div>
                </div>
                <div className="p-4">
                  <p className="text-[9px] uppercase tracking-wider text-black/35">Совпало</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{["Не курит","Любит порядок","Есть кот"].map(tag => <span key={tag} className="rounded-full bg-[#F4F4F2] px-2 py-1 text-[8px]">{tag}</span>)}</div>
                  <button type="button" className="mt-4 w-full rounded-full bg-black py-2.5 text-[10px] font-semibold text-white">Написать Марии</button>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        <section id="reviews" className="mx-auto max-w-[1440px] px-5 py-28 sm:px-10 lg:px-16 lg:py-36">
          <Reveal className="flex items-end justify-between gap-8">
            <div>
              <SectionLabel>Отзывы</SectionLabel>
              <h2 className="mt-5 max-w-[780px] font-heading text-5xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Реальные люди.<br />Реальные истории.</h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button type="button" onClick={() => scrollReviews(-1)} aria-label="Предыдущий отзыв" className="grid size-12 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-[#D6FF3F]"><ArrowLeft className="size-4" /></button>
              <button type="button" onClick={() => scrollReviews(1)} aria-label="Следующий отзыв" className="grid size-12 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-[#D6FF3F]"><ArrowRight className="size-4" /></button>
            </div>
          </Reveal>

          <div ref={reviewsRef} className="hide-scrollbar -mr-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pr-5 sm:-mr-10 sm:pr-10 lg:-mr-16 lg:pr-16">
            {[...landingReviews, {name:"Женя, 28",role:"Архитектор",quote:"«В анкете нашлись важные мелочи, о которых обычно неловко спрашивать. Поэтому дома сразу было спокойно.»",image:"/demo/people/zhenya.jpg"}].map((review, index) => (
              <motion.article key={review.name} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, delay: index * 0.06, ease }} className="group relative h-[500px] w-[82vw] max-w-[370px] shrink-0 snap-start overflow-hidden rounded-[30px] bg-black sm:h-[540px]">
                <MediaImage src={review.image} alt={review.name} sizes="370px" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                  <p className="text-base leading-relaxed text-white/90">{review.quote}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                    <div><p className="text-sm font-semibold">{review.name}</p><p className="mt-1 text-xs text-white/45">{review.role}</p></div>
                    <span className="grid size-10 place-items-center rounded-full bg-[#D6FF3F] text-black"><Sparkles className="size-4" /></span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto grid max-w-[1312px] gap-12 px-5 pb-28 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-0 lg:pb-36">
          <Reveal>
            <SectionLabel>Коротко о важном</SectionLabel>
            <h2 className="mt-5 font-heading text-5xl font-bold tracking-[-0.045em] sm:text-6xl">Можно спросить</h2>
          </Reveal>
          <Reveal delay={0.1} className="divide-y divide-black/10 border-y border-black/10">
            {[
              ["Профили действительно проверяют?", "Да. Мы подтверждаем телефон и основные данные, а подозрительные анкеты отправляем на ручную проверку."],
              ["Подбор соседей платный?", "Базовый поиск и просмотр совпадений доступны бесплатно. Дополнительные функции можно подключить позже."],
              ["Можно искать только квартиру?", "Да. Вы можете прийти своей группой или сначала найти жильё, а затем добрать соседей."],
            ].map(([question, answer], index) => (
              <details key={question} open={index === 0} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-heading text-lg font-bold"><span>{question}</span><ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" /></summary>
                <p className="max-w-[650px] pr-10 pt-3 text-sm leading-relaxed text-black/50">{answer}</p>
              </details>
            ))}
          </Reveal>
        </section>

        <section className="group relative mx-4 mb-8 min-h-[540px] overflow-hidden rounded-[36px] bg-[#0D0D0C] text-white sm:mx-8 lg:grid lg:min-h-[430px] lg:grid-cols-[1fr_0.85fr] lg:rounded-[48px]">
          <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <SectionLabel dark>Пора знакомиться</SectionLabel>
            <h2 className="mt-6 max-w-[620px] font-heading text-5xl font-bold leading-[0.93] tracking-[-0.045em] sm:text-6xl">Готовы найти<br />своё место?</h2>
            <p className="mt-5 text-sm text-white/50 sm:text-base">Начните с анкеты — это займёт около трёх минут.</p>
            <Link href="/app/compatibility" className="mt-8 inline-flex h-14 w-fit items-center gap-3 rounded-full bg-[#D6FF3F] px-7 text-sm font-semibold text-black transition hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(214,255,63,0.2)]">
              Создать профиль <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="relative min-h-[300px] overflow-hidden lg:min-h-full">
            <MediaImage src="/demo/properties/yubileyniy-room.jpg" alt="Уютная спальня в квартире для совместной аренды" sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-1000 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0C] via-[#0D0D0C]/25 to-transparent lg:block" />
            <svg className="absolute -bottom-28 -right-20 w-[75%] text-[#D6FF3F] transition duration-700 group-hover:-translate-x-3 group-hover:-translate-y-2" viewBox="0 0 500 300" fill="none" aria-hidden="true"><path d="M20 250C120 55 244 45 480 28" stroke="currentColor" strokeWidth="72" strokeLinecap="round" /></svg>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 border-b border-black/10 pb-14 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" className="font-heading text-3xl font-bold tracking-[-0.04em]">соседи<span className="text-[#A8CE00]">.</span></Link>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-black/45">Люди, жильё и понятные правила для спокойной совместной жизни.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {[
              ["Сервис",[["Поиск соседей","/app/roommates"],["Поиск жилья","/app/housing"],["Моя группа","/app/group"],["Избранное","/app/favorites"]]],
              ["Компания",[["О проекте","/about"],["Собственникам","/owners"],["Безопасность","/safety"],["Контакты","/faq"]]],
              ["Поддержка",[["FAQ","/faq"],["Справочный центр","/faq"],["Условия","/safety"],["Конфиденциальность","/safety"]]],
            ].map(([title, links]) => (
              <div key={String(title)}><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">{String(title)}</p><ul className="mt-5 space-y-3">{(links as string[][]).map(([label,href]) => <li key={label}><Link href={href} className="text-sm text-black/60 transition hover:text-black">{label}</Link></li>)}</ul></div>
            ))}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">Приложение</p>
              <div className="mt-5 space-y-2">
                <span className="flex w-fit items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-[10px]"><Apple className="size-4" /> App Store</span>
                <span className="flex w-fit items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-[10px]"><Smartphone className="size-4" /> Google Play</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-black/35 sm:flex-row sm:items-center sm:justify-between"><p>© 2024–2026 Соседи. Все права защищены.</p><p>Сделано в Краснодаре</p></div>
      </footer>
    </div>
  );
}
