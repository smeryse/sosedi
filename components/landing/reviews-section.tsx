"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MediaImage } from "@/components/ui/media-image";
import { landingReviews } from "@/data/landing";
import { Reveal, landingEase } from "@/components/landing/reveal";

const reviews = [
  ...landingReviews,
  {
    name: "Женя, 28",
    role: "Архитектор",
    quote:
      "«В анкете нашлись важные мелочи, о которых обычно неловко спрашивать. Поэтому дома сразу было спокойно.»",
    image: "/demo/people/zhenya.jpg",
  },
];

export function ReviewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const scroll = (direction: -1 | 1) => {
    containerRef.current?.scrollBy({
      left: direction * 380,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="reviews"
      className="overflow-hidden bg-[#F4F4F0] px-5 py-24 text-black sm:px-10 md:py-36 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex items-end justify-between gap-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-black/45">
              <span className="size-2 rounded-full bg-[#A8CE00]" /> Отзывы
            </p>
            <h2 className="mt-5 font-heading text-4xl font-bold leading-[0.98] tracking-tight sm:text-5xl md:text-6xl">
              Реальные люди. <br />
              <em
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                }}
                className="not-italic text-[#628B36]"
              >
                Реальные истории.
              </em>
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Предыдущий отзыв"
              className="grid size-12 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-[#D6FF3F]"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Следующий отзыв"
              className="grid size-12 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-[#D6FF3F]"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </Reveal>

        <div
          ref={containerRef}
          className="hide-scrollbar -mr-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pr-5 sm:-mr-10 sm:pr-10 lg:-mr-16 lg:pr-16"
        >
          {reviews.map((review, index) => (
            <motion.article
              key={review.name}
              initial={reduceMotion ? false : { opacity: 0, x: 40 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.7,
                delay: index * 0.06,
                ease: landingEase,
              }}
              className="group relative h-[480px] w-[82vw] max-w-[370px] shrink-0 snap-start overflow-hidden rounded-3xl bg-black shadow-xl sm:h-[540px]"
            >
              <MediaImage
                src={review.image}
                alt={review.name}
                sizes="370px"
                className="object-cover object-[center_28%] transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                <p className="text-base leading-relaxed text-white/90">
                  {review.quote}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                  <div>
                    <p className="text-sm font-semibold">{review.name}</p>
                    <p className="mt-1 text-xs text-white/45">{review.role}</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full bg-[#D6FF3F] text-black">
                    <Sparkles className="size-4" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
