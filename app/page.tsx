import Link from "next/link";
import { ArrowRight, MapPin, Play } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AvatarImage } from "@/components/ui/avatar-image";
import { MediaImage } from "@/components/ui/media-image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#111111]">
      {/* 1. Header */}
      <header className="sticky top-0 z-50 border-b border-[#E5E5E0]/70 bg-[#F7F8F3]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1340px] items-center justify-between px-5 lg:px-8">
          <BrandLogo className="[&_img]:h-auto [&_img]:w-[136px]" />

          <nav className="hidden items-center gap-8 text-[13px] font-bold text-[#6B6F66] md:flex">
            <a href="#about" className="transition-colors hover:text-[#111111]">
              О проекте
            </a>
            <a href="#how" className="transition-colors hover:text-[#111111]">
              Как это работает
            </a>
            <a href="#product" className="transition-colors hover:text-[#111111]">
              Возможности
            </a>
            <a href="#reviews" className="transition-colors hover:text-[#111111]">
              Отзывы
            </a>
            <a href="#faq" className="transition-colors hover:text-[#111111]">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden text-[13px] font-extrabold text-[#111111] hover:underline sm:inline-block pr-2"
            >
              Войти
            </Link>
            <Link
              href="/app"
              className="lime-button inline-flex h-[44px] items-center gap-2 rounded-full px-5 text-[12.5px] font-extrabold shadow-sm hover:scale-[1.02]"
            >
              Начать поиск <ArrowRight className="size-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1340px] px-5 lg:px-8">
        {/* 2. Hero Section */}
        <section className="py-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left Hero Content */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-3.5 py-1.5 text-[11px] font-extrabold text-[#111111] shadow-sm">
                <span className="size-2 rounded-full bg-[#B3DB00]" />
                Поиск соседей и квартир в Краснодаре
              </div>

              <h1 className="text-[40px] font-black leading-[1.05] tracking-tight text-[#111111] sm:text-[54px] lg:text-[62px]">
                Дом начинается <br />
                <span className="text-[#111111]">с подходящих людей.</span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#6B6F66]">
                Платформа для совместного проживания людей, которые совпадают по
                ценностям, образу жизни и планам. Без случайных людей и сюрпризов после переезда.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/app"
                  className="lime-button inline-flex h-[52px] items-center gap-2.5 rounded-full px-7 text-[14px] font-extrabold shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Найти соседей <ArrowRight className="size-4 stroke-[2.5]" />
                </Link>

                <a
                  href="#how"
                  className="inline-flex h-[52px] items-center gap-2.5 rounded-full border border-[#E5E5E0] bg-white px-6 text-[14px] font-extrabold text-[#111111] shadow-sm transition-colors hover:bg-[#F4F4F0]"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-[#F4F4F0]">
                    <Play className="size-3.5 fill-[#111111] text-[#111111] ml-0.5" />
                  </span>
                  Смотреть ролик
                </a>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["maria", "artem", "ekaterina", "ilya"].map((id) => (
                    <AvatarImage
                      key={id}
                      src={`/demo/people/${id}.jpg`}
                      name="Пользователь"
                      size={40}
                      className="size-10 ring-2 ring-white"
                    />
                  ))}
                </div>
                <p className="text-[12px] font-bold text-[#6B6F66]">
                  Уже <span className="font-extrabold text-[#111111]">12 500+ человек</span> нашли своих соседей с нами
                </p>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative min-h-[340px] overflow-hidden rounded-[26px] border border-[#E5E5E0] bg-white shadow-md sm:col-span-2 sm:min-h-[380px]">
                <MediaImage
                  src="/demo/properties/center-loft.jpg"
                  alt="Совместная жизнь в Краснодаре"
                  sizes="600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-[#111111] shadow-sm backdrop-blur-sm">
                  <MapPin className="size-3.5 text-[#7B9E00]" /> Краснодар
                </span>

                <div className="absolute bottom-5 left-5 right-5 rounded-[20px] bg-white/95 p-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <AvatarImage
                      src="/demo/people/maria.jpg"
                      name="Мария"
                      size={44}
                      className="size-11"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-black text-[#111111]">
                        Мария, 24 · Маркетолог
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6B6F66]">
                        Центральный район · ищет 1-2 соседей
                      </p>
                    </div>
                    <span className="rounded-full bg-[#EBF7B6] px-3 py-1 text-[11px] font-black text-[#7B9E00]">
                      96% match
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[140px] overflow-hidden rounded-[22px] border border-[#E5E5E0] bg-white p-4 shadow-sm">
                <MediaImage
                  src="/demo/properties/festival-flat.jpg"
                  alt="Современные квартиры"
                  sizes="280px"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
                  Современные квартиры
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-[22px] border border-[#E5E5E0] bg-[#111111] p-4 text-white shadow-sm">
                <p className="text-[11px] font-bold text-white/70">
                  Совместимость по 30+ параметрам
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-[36px] font-black text-[#B3DB00]">92%</span>
                  <div className="flex -space-x-1.5">
                    {["artem", "ekaterina"].map((id) => (
                      <AvatarImage
                        key={id}
                        src={`/demo/people/${id}.jpg`}
                        name="Пользователь"
                        size={28}
                        className="size-7 ring-2 ring-[#111111]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Metrics Section */}
        <section className="my-6 rounded-[26px] border border-[#E5E5E0] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-[#E5E5E0]">
            {[
              ["12 500+", "пользователей ищут жильё"],
              ["3 200+", "проверенных квартир от собственников"],
              ["16", "районов Краснодара в каталоге"],
              ["4.9 ★", "средняя оценка удобства сервиса"],
            ].map(([val, desc], idx) => (
              <div key={val} className={idx > 0 ? "md:pl-6" : ""}>
                <p className="text-[28px] font-black tracking-tight text-[#111111] sm:text-[34px]">
                  {val}
                </p>
                <p className="mt-1 text-[12px] font-medium text-[#6B6F66]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. How it Works Section */}
        <section id="how" className="py-14">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#7B9E00]">
                • КАК ЭТО РАБОТАЕТ
              </p>
              <h2 className="mt-2 text-[32px] font-black tracking-tight text-[#111111] sm:text-[40px]">
                Просто. Честно. По-взрослому.
              </h2>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#111111] hover:underline"
            >
              Узнать подробнее <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Находим подходящих соседей",
                desc: "Умный алгоритм подбирает людей, с которыми комфортно жить вместе по образу жизни, режиму и привычкам.",
                badge: "92% match",
                avatars: ["maria", "artem", "ekaterina"],
              },
              {
                step: "02",
                title: "Выбираем жильё",
                desc: "Проверенные квартиры от собственников с понятными условиями, реальными фото и правилами.",
                image: "/demo/properties/festival-flat.jpg",
              },
              {
                step: "03",
                title: "Заселяемся вместе",
                desc: "Собирайте группу до 4 человек, подавайте общую заявку и переезжайте без стресса и рисков.",
                image: "/demo/properties/park-room.jpg",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col justify-between rounded-[26px] border border-[#E5E5E0] bg-white p-6 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div>
                  <span className="text-[14px] font-black text-[#6B6F66]">{item.step}</span>
                  <h3 className="mt-4 text-[20px] font-extrabold text-[#111111]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#6B6F66]">{item.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E5E0]/60">
                  {item.avatars ? (
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {item.avatars.map((id) => (
                          <AvatarImage
                            key={id}
                            src={`/demo/people/${id}.jpg`}
                            name="Сосед"
                            size={36}
                            className="size-9 ring-2 ring-white"
                          />
                        ))}
                      </div>
                      <span className="rounded-full bg-[#EBF7B6] px-3 py-1 text-[11px] font-black text-[#7B9E00]">
                        {item.badge}
                      </span>
                    </div>
                  ) : item.image ? (
                    <div className="relative h-[110px] w-full overflow-hidden rounded-[16px]">
                      <MediaImage
                        src={item.image}
                        alt={item.title}
                        sizes="320px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Product Showcase Section */}
        <section id="product" className="py-12">
          <div className="overflow-hidden rounded-[30px] border border-[#E5E5E0] bg-white shadow-lg">
            <div className="grid lg:grid-cols-[380px_minmax(0,1fr)]">
              {/* Lime Left Block */}
              <div className="flex flex-col justify-between bg-[#B3DB00] p-8 text-[#111111]">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">
                    • НАШ ПРОДУКТ
                  </span>
                  <h2 className="mt-6 text-[36px] font-black leading-none tracking-tight">
                    Всё в одном месте
                  </h2>
                  <p className="mt-4 text-[14px] leading-6 font-medium text-[#111111]/80">
                    От подбора соседей до управления бюджетом и бытом — в современном удобном сервисе.
                  </p>
                </div>

                <div className="mt-8 rounded-[22px] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <AvatarImage
                      src="/demo/people/maria.jpg"
                      name="Мария"
                      size={40}
                      className="size-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-black">Мария, 24</p>
                      <p className="text-[10px] text-[#6B6F66]">Совместимость 96%</p>
                    </div>
                    <span className="size-2 rounded-full bg-[#7B9E00]" />
                  </div>
                  <div className="mt-3 flex gap-1 text-[9px] font-bold">
                    <span className="rounded-full bg-[#F4F4F0] px-2 py-1">Чистота 95%</span>
                    <span className="rounded-full bg-[#F4F4F0] px-2 py-1">Тишина 90%</span>
                  </div>
                </div>
              </div>

              {/* Interface Preview Right Area */}
              <div className="bg-[#F4F4F0] p-6 lg:p-8">
                <div className="overflow-hidden rounded-[22px] border border-[#E5E5E0] bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E5E5E0] px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <BrandLogo className="[&_img]:h-auto [&_img]:w-[100px]" />
                      <span className="hidden rounded-full bg-[#EBF7B6] px-3 py-1 text-[10px] font-extrabold text-[#7B9E00] sm:inline-block">
                        Краснодар
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#F4F4F0] px-3 py-1 text-[10px] font-bold text-[#6B6F66]">
                        Поиск жилья & соседей
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 md:grid-cols-[1fr_260px]">
                    <div className="space-y-3">
                      {[
                        {
                          title: "2-комн. квартира в центре",
                          price: "38 000 ₽ / мес.",
                          district: "Фестивальный",
                          match: 92,
                          img: "/demo/properties/center-loft.jpg",
                        },
                        {
                          title: "Студия у парка Галицкого",
                          price: "28 000 ₽ / мес.",
                          district: "Панорама",
                          match: 89,
                          img: "/demo/properties/festival-flat.jpg",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex items-center gap-4 rounded-[18px] border border-[#E5E5E0] p-3 transition-colors hover:bg-[#F4F4F0]"
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
                            <p className="text-[13px] font-black">{item.price}</p>
                            <p className="truncate text-[11px] font-bold text-[#111111]">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-[#6B6F66]">{item.district}</p>
                          </div>
                          <span className="rounded-full bg-[#EBF7B6] px-2.5 py-1 text-[10px] font-black text-[#7B9E00]">
                            {item.match}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col justify-between rounded-[18px] border border-[#E5E5E0] bg-[#F4F4F0] p-4">
                      <div>
                        <p className="text-[11px] font-bold text-[#6B6F66]">Общий бюджет группы</p>
                        <p className="mt-1 text-[22px] font-black text-[#111111]">120 000 ₽ / мес.</p>
                        <p className="mt-1 text-[10px] text-[#7B9E00]">3 участника готовы к заселению</p>
                      </div>
                      <Link
                        href="/app"
                        className="mt-4 flex h-9 w-full items-center justify-center rounded-full bg-[#111111] text-[10.5px] font-extrabold text-white"
                      >
                        Открыть приложение →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Reviews Section */}
        <section id="reviews" className="py-14">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#7B9E00]">
                • ОТЗЫВЫ
              </p>
              <h2 className="mt-2 text-[32px] font-black tracking-tight text-[#111111] sm:text-[40px]">
                Реальные люди. Реальные истории.
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                name: "Александра, 23",
                role: "Студентка КубГУ",
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
                quote: "«Нашли квартиру мечты у парка Галицкого и заселились своей группой за неделю. Очень удобно!»",
                img: "/demo/people/ilya.jpg",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="flex flex-col justify-between rounded-[26px] border border-[#E5E5E0] bg-white p-6 shadow-sm"
              >
                <p className="text-[13.5px] leading-6 text-[#111111] font-medium">{review.quote}</p>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-[#E5E5E0]/60">
                  <AvatarImage
                    src={review.img}
                    name={review.name}
                    size={42}
                    className="size-10"
                  />
                  <div>
                    <p className="text-[12px] font-extrabold text-[#111111]">{review.name}</p>
                    <p className="text-[10px] text-[#6B6F66]">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Final CTA Section */}
        <section className="my-10 overflow-hidden rounded-[30px] bg-[#111111] p-8 text-white shadow-xl sm:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[32px] font-black tracking-tight sm:text-[44px]">
                Готовы найти своё место?
              </h2>
              <p className="mt-2 text-[14px] text-white/70">
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

        {/* 8. Footer */}
        <footer className="border-t border-[#E5E5E0] py-10 text-[12px] text-[#6B6F66]">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <BrandLogo className="[&_img]:h-auto [&_img]:w-[120px]" />
              <p className="mt-4 text-[11px] leading-5 text-[#6B6F66]">
                Платформа для совместной аренды жилья и поиска проверенных соседей в Краснодаре.
              </p>
            </div>

            <div>
              <p className="font-extrabold text-[#111111]">Сервис</p>
              <ul className="mt-3 space-y-2 text-[11.5px]">
                <li><Link href="/app/roommates" className="hover:text-[#111111]">Поиск соседей</Link></li>
                <li><Link href="/app/housing" className="hover:text-[#111111]">Поиск жилья</Link></li>
                <li><Link href="/app/group" className="hover:text-[#111111]">Моя группа</Link></li>
                <li><Link href="/app/favorites" className="hover:text-[#111111]">Избранное</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-extrabold text-[#111111]">Компания</p>
              <ul className="mt-3 space-y-2 text-[11.5px]">
                <li><Link href="/about" className="hover:text-[#111111]">О проекте</Link></li>
                <li><Link href="/safety" className="hover:text-[#111111]">Безопасность</Link></li>
                <li><Link href="/owners" className="hover:text-[#111111]">Собственникам</Link></li>
                <li><Link href="/faq" className="hover:text-[#111111]">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-extrabold text-[#111111]">Контакты</p>
              <p className="mt-3 text-[11.5px]">Краснодар, ул. Красная, 176</p>
              <p className="mt-1 text-[11.5px] font-bold text-[#111111]">support@sosedi-app.ru</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#E5E5E0] pt-6 text-[11px] sm:flex-row">
            <p>© 2024–2026 Соседи. Все права защищены.</p>
            <div className="flex gap-4">
              <Link href="/safety">Условия использования</Link>
              <Link href="/safety">Политика конфиденциальности</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
