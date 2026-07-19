"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { AvatarImage } from "@/components/ui/avatar-image";
import { landingEase } from "@/components/landing/reveal";

const people = ["maria", "artem", "ekaterina", "ilya"];

const heroVideos = [
  {
    label: "Краснодар",
    src: "https://videos.pexels.com/video-files/6113728/6113728-hd_1920_1080_30fps.mp4",
  },
  {
    label: "Олимпийский парк, Сочи",
    src: "https://videos.pexels.com/video-files/12215893/12215893-uhd_2560_1440_25fps.mp4",
  },
  {
    label: "Побережье Сочи",
    src: "https://videos.pexels.com/video-files/10870687/10870687-uhd_2560_1440_25fps.mp4",
  },
];

export function LandingHero() {
  const reduceMotion = useReducedMotion();
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveVideo((current) => (current + 1) % heroVideos.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      if (index === activeVideo) {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
        return;
      }

      video.pause();
    });
  }, [activeVideo]);

  return (
    <section className="relative mb-[-25px] flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-28 md:pb-24">
      <div className="absolute inset-0" aria-hidden="true">
        {heroVideos.map((video, index) => (
          <video
            key={video.src}
            ref={(element) => {
              videoRefs.current[index] = element;
            }}
            autoPlay={index === 0}
            muted
            loop
            playsInline
            preload={index === 0 ? "auto" : "metadata"}
            style={{ transitionDuration: "1600ms" }}
            className={`absolute inset-0 h-full w-full scale-[1.02] object-cover transition-opacity ease-in-out ${
              index === activeVideo ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={video.src} type="video/mp4" />
          </video>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#164C30]/30 via-transparent to-[#D6FF3F]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: landingEase }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 text-center"
      >
        <h1 className="font-heading text-5xl font-bold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[88px]">
          <span className="block">Соседи делают жизнь</span>
          <em
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
            }}
            className="block not-italic text-[#D6FF3F]"
          >
            лучше
          </em>
        </h1>

        <p className="mt-5 max-w-[560px] text-sm font-medium leading-relaxed text-white/80 sm:text-base md:text-lg">
          Находим людей, жильё и правила, с которыми спокойно жить. Совпадение
          по привычкам, бюджету и планам — до первого просмотра.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/app/roommates"
            className="flex items-center justify-center gap-2 rounded-full bg-[#D6FF3F] px-7 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-[#c4ed27]"
          >
            Найти соседей
            <ArrowUpRight className="size-4" />
          </Link>
          <a
            href="#how"
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/25 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/40"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white text-black">
              <Play className="ml-0.5 size-3 fill-black" />
            </span>
            Смотреть, как работает
          </a>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex -space-x-3">
            {people.map((id) => (
              <AvatarImage
                key={id}
                src={`/demo/people/${id}.jpg`}
                name="Пользователь Соседей"
                size={38}
                className="size-9 ring-2 ring-black/40"
              />
            ))}
          </div>
          <p className="max-w-[220px] text-left text-xs leading-relaxed text-white/65">
            Люди, жильё и понятные правила для спокойной совместной жизни
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3" aria-label="Выбор видео">
          <p className="text-xs font-medium text-white/70" aria-live="polite">
            {heroVideos[activeVideo].label}
          </p>
          <div className="flex items-center gap-1.5">
            {heroVideos.map((video, index) => (
              <button
                key={video.label}
                type="button"
                aria-label={`Показать видео: ${video.label}`}
                aria-pressed={index === activeVideo}
                onClick={() => setActiveVideo(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === activeVideo
                    ? "w-10 bg-[#D6FF3F]"
                    : "w-4 bg-white/40 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
