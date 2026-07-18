import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Play,
  Search,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MediaImage } from "@/components/ui/media-image";
import { LandingHeader } from "@/components/landing-header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#111111] font-sans antialiased">
      <LandingHeader />

      <main className="mx-auto max-w-[1360px] px-5 lg:px-8">
        {/* 2. Hero Section (Exact 0.png composition) */}
        <section className="pb-12 pt-6 lg:pb-16 lg:pt-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_540px] xl:grid-cols-[1fr_580px] lg:items-center">
            {/* Left Hero Column */}
            <div>
              <h1 className="text-[44px] font-black leading-[1.02] tracking-[-0.04em] text-[#111111] sm:text-[58px] lg:text-[66px] xl:text-[72px]">
                Соседи <br />
                делают жизнь <br />
                <span className="inline-flex items-center gap-3">
                  лучше
                  <span className="grid size-12 place-items-center rounded-full bg-[#B3DB00] text-[#111111] shadow-sm sm:size-14">
                    <ArrowRight className="size-6 stroke-[2.8]" />
                  </span>
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#6B6F66] font-medium">
                Платформа для совместного проживания людей, которые совпадают по
                ценностям, образу жизни и планам.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/app"
                  className="lime-button inline-flex h-[52px] items-center gap-2 rounded-full px-7 text-[13.5px] font-black shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Найти соседей
                </Link>

                <a
                  href="#how"
                  className="inline-flex h-[52px] items-center gap-2.5 rounded-full border border-[#E5E5E0] bg-white px-6 text-[13.5px] font-bold text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-[#F4F4F0]">
                    <Play className="size-3.5 fill-[#111111] text-[#111111] ml-0.5" />
                  </span>
                  Смотреть ролик
                </a>
              </div>

              <div className="mt-9 flex items-center gap-3.5">
                <div className="flex -space-x-2.5">
                  {["maria", "artem", "ekaterina", "ilya"].map((id) => (
                    <AvatarImage
                      key={id}
                      src={`/demo/people/${id}.jpg`}
                      name="Пользователь"
                      size={40}
                      className="size-10 ring-2 ring-[#F4F4F0]"
                    />
                  ))}
                </div>
                <p className="text-[12px] font-bold text-[#6B6F66]">
                  Уже <span className="font-black text-[#111111]">12 500 человек</span> нашли своих соседей вместе с нами
                </p>
              </div>
            </div>

            {/* Right Hero Image Collage (Exact match to 0.png) */}
            <div className="grid grid-cols-[1fr_210px] gap-3.5 sm:grid-cols-[1fr_240px]">
              {/* Left Main Large Photo Card */}
              <div className="relative min-h-[380px] overflow-hidden rounded-[28px] border border-[#E5E5E0] bg-white shadow-md sm:min-h-[420px]">
                <MediaImage
                  src="/demo/properties/center-loft.jpg"
                  alt="Совместная жизнь в Краснодаре"
                  sizes="400px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-[#111111] shadow-sm backdrop-blur-sm">
                  <MapPin className="size-3.5 text-[#7B9E00]" /> Краснодар
                </span>

                <div className="absolute bottom-4 left-4 right-4 rounded-[20px] bg-white/95 p-3.5 shadow-md backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <AvatarImage
                      src="/demo/people/maria.jpg"
                      name="Мария"
                      size={40}
                      className="size-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-black text-[#111111]">
                        Мария, 24 · Маркетолог
                      </p>
                      <p className="text-[10px] text-[#6B6F66]">
                        Центральный район · ищет 1-2 соседей
                      </p>
                    </div>
                    <span className="rounded-full bg-[#EBF7B6] px-2.5 py-1 text-[10.5px] font-black text-[#7B9E00]">
                      96% match
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Stacked Column Cards */}
              <div className="flex flex-col gap-3.5">
                {/* Top Right Card: Modern Apartments */}
                <div className="relative h-[125px] overflow-hidden rounded-[22px] border border-[#E5E5E0] bg-white shadow-sm">
                  <MediaImage
                    src="/demo/properties/festival-flat.jpg"
                    alt="Современные квартиры"
                    sizes="240px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[9.5px] font-extrabold text-white backdrop-blur-sm">
                    Современные квартиры
                  </span>
                </div>

                {/* Middle Right Card: Verified Roommates */}
                <div className="relative h-[125px] overflow-hidden rounded-[22px] border border-[#E5E5E0] bg-white shadow-sm">
                  <MediaImage
                    src="/demo/people/ekaterina.jpg"
                    alt="Проверенные соседи"
                    sizes="240px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[9.5px] font-extrabold text-white backdrop-blur-sm">
                    Проверенные соседи
                  </span>
                </div>

                {/* Bottom Right Dark Card: Compatibility Score */}
                <div className="flex min-h-[145px] flex-col justify-between rounded-[22px] border border-[#E5E5E0] bg-[#111111] p-4 text-white shadow-md">
                  <p className="text-[10.5px] font-bold leading-4 text-white/80">
                    Совместимость по 30+ параметрам
                  </p>

                  <div className="flex items-end justify-between">
                    <div className="flex -space-x-1.5">
                      {["artem", "ekaterina", "ilya"].map((id) => (
                        <AvatarImage
                          key={id}
                          src={`/demo/people/${id}.jpg`}
                          name="Пользователь"
                          size={26}
                          className="size-6 ring-2 ring-[#111111]"
                        />
                      ))}
                    </div>

                    <span className="grid size-11 place-items-center rounded-full bg-[#B3DB00] text-[13px] font-black text-[#111111]">
                      92%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Metrics Banner (Exact 0.png layout) */}
        <section className="my-6 rounded-[24px] bg-[#ECEFE8] p-6 shadow-sm border border-[#E0E4DB]">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-[#D8DDD1]">
            {[
              ["12 500+", "пользователей"],
              ["3 200+", "проверенных квартир"],
              ["16", "районов Краснодара"],
              ["4.9 ★", "средняя оценка"],
            ].map(([val, desc], idx) => (
              <div key={val} className={idx > 0 ? "md:pl-6" : ""}>
                <p className="text-[28px] font-black tracking-tight text-[#111111] sm:text-[34px]">
                  {val}
                </p>
                <p className="mt-1 text-[12px] font-bold text-[#6B6F66]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. "Как это работает" Section (Exact 0.png layout) */}
        <section id="how" className="py-14">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            {/* Left Header Column */}
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#7B9E00]">
                <span className="size-2 rounded-full bg-[#B3DB00]" /> КАК ЭТО РАБОТАЕТ
              </p>
              <h2 className="mt-4 text-[38px] font-black leading-[1.08] tracking-[-0.03em] text-[#111111] sm:text-[46px]">
                Просто. <br />
                Честно. <br />
                По-взрослому.
              </h2>
              <Link
                href="/app"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-5 py-2.5 text-[12px] font-extrabold text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
              >
                Узнать подробнее <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Right 3 Step Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Находим подходящих соседей",
                  desc: "Умный алгоритм подбирает людей, с которыми комфортно жить вместе.",
                  badge: "92%",
                  avatars: ["maria", "artem", "ekaterina"],
                },
                {
                  step: "02",
                  title: "Выбираем жильё",
                  desc: "Проверенные квартиры от собственников и агентств. Фото, документы, условия.",
                  image: "/demo/properties/festival-flat.jpg",
                },
                {
                  step: "03",
                  title: "Заселяемся вместе",
                  desc: "Собирайте группу, подавайте общую заявку и переезжайте без стресса.",
                  image: "/demo/properties/park-room.jpg",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col justify-between rounded-[24px] border border-[#E5E5E0] bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div>
                    <span className="text-[13px] font-black text-[#111111]">{item.step}</span>

                    {item.avatars ? (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {item.avatars.map((id) => (
                            <AvatarImage
                              key={id}
                              src={`/demo/people/${id}.jpg`}
                              name="Сосед"
                              size={34}
                              className="size-8 ring-2 ring-white"
                            />
                          ))}
                        </div>
                        <span className="grid size-8 place-items-center rounded-full bg-[#B3DB00] text-[10.5px] font-black text-[#111111]">
                          {item.badge}
                        </span>
                      </div>
                    ) : item.image ? (
                      <div className="relative mt-4 h-[100px] w-full overflow-hidden rounded-[16px]">
                        <MediaImage
                          src={item.image}
                          alt={item.title}
                          sizes="260px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <h3 className="mt-5 text-[17px] font-extrabold leading-6 text-[#111111]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[12px] leading-5 text-[#6B6F66] font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. "Всё в одном месте" Product Feature Banner (Exact 0.png layout) */}
        <section id="product" className="py-10">
          <div className="overflow-hidden rounded-[30px] border border-[#E5E5E0] bg-white shadow-lg">
            <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
              {/* Left Lime Block */}
              <div className="relative flex flex-col justify-between bg-[#B3DB00] p-8 text-[#111111]">
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#111111]">
                    <span className="size-2 rounded-full bg-[#111111]" /> НАШ ПРОДУКТ
                  </p>
                  <h2 className="mt-5 text-[42px] font-black leading-[0.98] tracking-[-0.04em]">
                    Всё <br />
                    в одном <br />
                    месте
                  </h2>
                  <p className="mt-4 max-w-xs text-[13.5px] font-semibold leading-6 text-[#111111]/85">
                    От подбора соседей до управления бюджетом и бытом — в современном удобном сервисе.
                  </p>
                </div>

                <div className="mt-8 rounded-[24px] bg-white p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <AvatarImage
                      src="/demo/people/maria.jpg"
                      name="Мария"
                      size={44}
                      className="size-11"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-black text-[#111111]">Мария, 24</p>
                      <p className="text-[10px] text-[#6B6F66]">Маркетолог · Центр</p>
                    </div>
                    <span className="rounded-full bg-[#EBF7B6] px-2.5 py-1 text-[10px] font-black text-[#7B9E00]">
                      90%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Interface Preview App Window */}
              <div className="bg-[#F4F4F0] p-6 lg:p-8">
                <div className="overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white shadow-md">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-[#FAFAFA] px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <BrandLogo className="[&_img]:h-auto [&_img]:w-[108px]" />
                      <label className="hidden h-9 w-[260px] items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-3.5 text-[11px] text-[#878881] sm:flex">
                        <Search className="size-3.5 text-[#878881]" />
                        <span>Поиск по району...</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#EBF7B6] px-3 py-1 text-[10px] font-black text-[#7B9E00]">
                        Список
                      </span>
                      <span className="rounded-full bg-[#F4F4F0] px-3 py-1 text-[10px] font-bold text-[#6B6F66]">
                        Карта
                      </span>
                    </div>
                  </div>

                  {/* Mockup Body */}
                  <div className="grid gap-4 p-5 md:grid-cols-[1fr_260px]">
                    <div className="space-y-3">
                      {[
                        {
                          title: "2-комн. квартира",
                          price: "38 000 ₽ / мес.",
                          district: "Фестивальный",
                          img: "/demo/properties/center-loft.jpg",
                        },
                        {
                          title: "Студия у парка",
                          price: "28 000 ₽ / мес.",
                          district: "Панорама",
                          img: "/demo/properties/festival-flat.jpg",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex items-center gap-3.5 rounded-[18px] border border-[#E5E5E0] bg-white p-3 shadow-sm"
                        >
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-[14px]">
                            <MediaImage
                              src={item.img}
                              alt={item.title}
                              sizes="100px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-black text-[#111111]">{item.price}</p>
                            <p className="truncate text-[11.5px] font-bold text-[#111111]">{item.title}</p>
                            <p className="text-[10px] text-[#6B6F66]">{item.district}</p>
                          </div>
                          <button type="button" aria-label="В избранное" className="grid size-8 place-items-center rounded-full bg-[#F4F4F0]">
                            <Heart className="size-3.5 text-[#111111]" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col justify-between rounded-[20px] border border-[#E5E5E0] bg-[#F4F4F0] p-4">
                      <div>
                        <p className="text-[11px] font-bold text-[#6B6F66]">Общий бюджет группы</p>
                        <p className="mt-1 text-[24px] font-black text-[#111111]">120 000 ₽ <span className="text-[12px] font-normal text-[#6B6F66]">/ мес.</span></p>
                        <p className="mt-1.5 text-[10px] font-bold text-[#7B9E00]">3 участника готовы к переезду</p>
                      </div>

                      <Link
                        href="/app"
                        className="mt-4 flex h-9 w-full items-center justify-center rounded-full bg-[#111111] text-[11px] font-black text-white"
                      >
                        Открыть сервис →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Reviews Section (Exact 0.png layout) */}
        <section id="reviews" className="py-14">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#7B9E00]">
                <span className="size-2 rounded-full bg-[#B3DB00]" /> ОТЗЫВЫ
              </p>
              <h2 className="mt-3 text-[36px] font-black leading-[1.08] tracking-[-0.03em] text-[#111111] sm:text-[44px]">
                Реальные люди. <br />
                Реальные истории.
              </h2>
            </div>

            <div className="flex gap-2">
              <button type="button" aria-label="Предыдущий отзыв" className="grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm hover:bg-[#F4F4F0]">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" aria-label="Следующий отзыв" className="grid size-11 place-items-center rounded-full border border-[#E5E5E0] bg-white text-[#111111] shadow-sm hover:bg-[#F4F4F0]">
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                name: "Александра, 23",
                role: "Студентка",
                quote: "«Наша квартира в центре и соседи — как друзья. Без платформы точно бы не сошлось так идеально.»",
                img: "/demo/people/maria.jpg",
              },
              {
                name: "Дмитрий, 26",
                role: "Разработчик",
                quote: "«Впервые живём с незнакомыми людьми — и это лучший опыт. Сервис реально экономит время и нервы.»",
                img: "/demo/people/artem.jpg",
              },
              {
                name: "Илья, 25",
                role: "Маркетолог",
                quote: "«Нашли квартиру мечты и заселились своей группой за неделю. Очень удобно!»",
                img: "/demo/people/ilya.jpg",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="grid grid-cols-[110px_minmax(0,1fr)] overflow-hidden rounded-[24px] border border-[#E5E5E0] bg-white p-3.5 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="relative h-full min-h-[140px] overflow-hidden rounded-[18px]">
                  <MediaImage
                    src={review.img}
                    alt={review.name}
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between p-3 pl-3.5">
                  <p className="text-[12px] leading-5 font-medium text-[#111111]">{review.quote}</p>
                  <div className="mt-3 pt-2 border-t border-[#E5E5E0]/60">
                    <p className="text-[11.5px] font-black text-[#111111]">{review.name}</p>
                    <p className="text-[10px] text-[#6B6F66]">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Final CTA Section (Exact 0.png layout) */}
        <section className="my-10 overflow-hidden rounded-[30px] bg-[#111111] p-8 text-white shadow-xl sm:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[34px] font-black tracking-tight sm:text-[44px]">
                Готовы найти своё место?
              </h2>
              <p className="mt-2 text-[14px] font-medium text-white/70">
                Начните с анкеты — это займёт всего 3 минуты.
              </p>
            </div>

            <Link
              href="/app/compatibility"
              className="lime-button inline-flex h-[54px] items-center gap-2.5 rounded-full px-8 text-[14px] font-black transition-transform hover:scale-[1.02] shrink-0"
            >
              Создать профиль <ArrowRight className="size-4 stroke-[2.5]" />
            </Link>
          </div>
        </section>

        {/* 8. Footer (Exact 0.png layout) */}
        <footer className="border-t border-[#E5E5E0] py-10 text-[12px] text-[#6B6F66]">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <BrandLogo className="[&_img]:h-auto [&_img]:w-[124px]" />
              <p className="mt-3 text-[11px] text-[#6B6F66]">
                © 2024–2026. Все права защищены.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 text-[12px] font-semibold text-[#6B6F66]">
              <div>
                <p className="font-extrabold text-[#111111]">Сервис</p>
                <ul className="mt-2 space-y-1.5 text-[11.5px]">
                  <li><Link href="/app/roommates" className="hover:text-[#111111]">Поиск соседей</Link></li>
                  <li><Link href="/app/housing" className="hover:text-[#111111]">Поиск жилья</Link></li>
                  <li><Link href="/app/group" className="hover:text-[#111111]">Моя группа</Link></li>
                  <li><Link href="/app/favorites" className="hover:text-[#111111]">Избранное</Link></li>
                </ul>
              </div>

              <div>
                <p className="font-extrabold text-[#111111]">Компания</p>
                <ul className="mt-2 space-y-1.5 text-[11.5px]">
                  <li><Link href="/about" className="hover:text-[#111111]">О проекте</Link></li>
                  <li><Link href="/safety" className="hover:text-[#111111]">Карьера</Link></li>
                  <li><Link href="/owners" className="hover:text-[#111111]">Блог</Link></li>
                  <li><Link href="/faq" className="hover:text-[#111111]">Контакты</Link></li>
                </ul>
              </div>

              <div>
                <p className="font-extrabold text-[#111111]">Поддержка</p>
                <ul className="mt-2 space-y-1.5 text-[11.5px]">
                  <li><Link href="/faq" className="hover:text-[#111111]">FAQ</Link></li>
                  <li><Link href="/safety" className="hover:text-[#111111]">Справочный центр</Link></li>
                  <li><Link href="/safety" className="hover:text-[#111111]">Безопасность</Link></li>
                  <li><Link href="/safety" className="hover:text-[#111111]">Условия использования</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
