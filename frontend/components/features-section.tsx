"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface FeatureCardData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
}

const features: FeatureCardData[] = [
  {
    id: "feature-1",
    title: "Находим подходящих соседей",
    description:
      "Умный алгоритм подбирает людей, с которыми комфортно жить вместе. Совпадение по привычкам, бюджету и планам видно ещё до первого знакомства.",
    videoUrl:
      "/videos/feature-1.mp4",
    posterUrl: "/demo/people/maria.jpg",
  },
  {
    id: "feature-2",
    title: "Выбираем жильё",
    description:
      "Проверенные квартиры от собственников и партнёров: фотографии, документы, условия и понятная стоимость для каждого участника группы.",
    videoUrl:
      "/videos/feature-2.mp4",
    posterUrl: "/demo/properties/festival-flat.jpg",
  },
  {
    id: "feature-3",
    title: "Заселяемся вместе",
    description:
      "Собирайте группу, подавайте общую заявку и переезжайте без стресса. Чат, бытовые правила, задачи и общий бюджет остаются в одном сервисе.",
    videoUrl:
      "/videos/feature-3.mp4",
    posterUrl: "/demo/properties/park-room.jpg",
  },
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveFeature(index);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setRevealed((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
              });
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((card) => {
      if (card) {
        activeObserver.observe(card);
        revealObserver.observe(card);
      }
    });

    return () => {
      activeObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  const scrollToCard = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="how" className="relative text-white overflow-hidden py-20 md:py-40 lg:py-48 px-5 md:px-10 lg:px-16">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260709_082449_46df5cc4-ad98-4541-9236-a2659c1478a4.png&w=1920&q=85')`,
        }}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[460px_1fr] gap-12 lg:gap-24 xl:gap-48 items-start">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-between lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D6FF3F] mb-4">
              <span className="size-2 rounded-full bg-[#D6FF3F]" />
              Возможности Sosedi
            </span>
            <h2 className="text-white text-2xl sm:text-3xl lg:text-[44px] leading-[1.18] font-normal font-heading">
              Технологии, которые заботятся о вашем комфорте
            </h2>

            <div className="hidden lg:flex flex-col gap-3 mt-10">
              {features.map((feature, idx) => (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  className={`text-left text-sm font-medium px-4 py-3 rounded-2xl transition-all duration-300 ${
                    activeFeature === idx
                      ? "bg-black/40 text-white border border-[#D6FF3F]/40 shadow-lg translate-x-1"
                      : "bg-black/20 text-white/40 hover:text-white/70 hover:bg-black/30"
                  }`}
                >
                  {feature.title}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block pt-8 border-t border-white/10">
            <p className="text-xs text-white/60 mb-4 leading-relaxed">
              Никакого шума. Никаких случайных просмотров. Только ваш день, разложенный по полочкам.
            </p>
            <Link
              href="/app/roommates"
              className="inline-flex items-center justify-center gap-2 bg-[#D6FF3F] hover:bg-[#c4ed27] text-black font-semibold text-xs px-5 py-3 rounded-xl transition-all hover:scale-105"
            >
              <span>Подобрать соседей</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-16 md:gap-24">
          {features.map((feature, idx) => (
            <div
              key={feature.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              data-index={idx}
              className={`bg-black/40 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-white/10 transition-all duration-700 ease-out transform ${
                revealed[idx]
                  ? "translate-x-0 opacity-100"
                  : "translate-x-12 opacity-0"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 256 256"
                fill="none"
              >
                <path
                  d="M 256 256 L 178 256 C 150.386 256 128 233.614 128 206 L 128 256 L 0 256 L 0 192 C 0 156.654 28.654 128 64 128 C 99.346 128 128 156.654 128 192 L 128 128 L 256 128 Z M 78 0 C 105.614 0 128 22.386 128 50 L 128 0 L 256 0 L 256 64 C 256 99.346 227.346 128 192 128 C 156.654 128 128 99.346 128 64 L 128 128 L 0 128 L 0 0 Z"
                  fill="rgba(255,255,255,0.85)"
                />
              </svg>

              <h3 className="text-white text-xl md:text-2xl font-medium mt-4">
                {feature.title}
              </h3>

              <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 my-6 border border-white/5 relative shadow-2xl">
                <video
                  src={feature.videoUrl}
                  poster={feature.posterUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-white/70 font-medium text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
