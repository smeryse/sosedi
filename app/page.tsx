"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AboutSection } from "@/components/about-section";
import { FeaturesSection } from "@/components/features-section";
import { InteractiveDemoSection } from "@/components/interactive-demo-section";
import { OwnerSection } from "@/components/owner-section";
import { HackathonSection } from "@/components/hackathon-section";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0C] text-white overflow-x-clip">
      {/* Floating Centered Pill Navbar */}
      <Navbar />

      <main id="main-content">
        {/* SECTION 1: HERO (Full viewport height with video background) */}
        <section className="relative h-screen overflow-hidden mb-[-25px] flex flex-col justify-end pb-16 md:pb-24">
          {/* Background Video */}
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260711_090308_1dd0cea7-f9ba-4db4-8147-c7d746061c9e.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Semi-transparent Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-5 text-center flex flex-col items-center">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[92px] font-normal text-white leading-[1.08] tracking-tight font-heading">
              Найдите жильё.
              <br />
              без{" "}
              <em
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
                className="not-italic text-[#D6FF3F]"
              >
                лишнего стресса
              </em>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-[500px] leading-relaxed">
              Sosedi — спокойный умный сервис, который подбирает квартиру и совместимых соседей в Краснодаре по ритму жизни и бытовым привычкам.
            </p>

            {/* CTA Bar */}
            <div className="mt-8 bg-black/35 backdrop-blur-md border border-white/15 rounded-2xl pl-6 pr-2 py-2 flex items-center justify-between gap-4 max-w-2xl w-full">
              <span className="hidden sm:inline text-white/90 text-xs sm:text-sm font-medium text-left">
                Никакого шума. Никаких случайных просмотров. Только ваш идеальный дом.
              </span>
              <span className="sm:hidden text-white/90 text-xs font-medium text-left">
                Только ваш день, бережно организованный.
              </span>
              <Link
                href="/app/roommates"
                className="bg-[#D6FF3F] hover:bg-[#c4ed27] text-black font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 hover:scale-105"
              >
                <span>Начать подбор</span>
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2: ABOUT SECTION (Cream background with rounded top overlap) */}
        <AboutSection />

        {/* SECTION 3: FEATURES SECTION (Sticky left column + 3 scroll-triggered video cards) */}
        <FeaturesSection />

        {/* SECTION 4: INTERACTIVE DEMO (Lifestyle profile simulator & compatibility breakdown) */}
        <InteractiveDemoSection />

        {/* SECTION 5: FOR PROPERTY OWNERS ("Надёжные жильцы") */}
        <OwnerSection />

        {/* SECTION 6: REGIONAL HACKATHON CASE ("Создано за 48 часов") */}
        <HackathonSection />

        {/* SECTION 7: BOTTOM CTA HERO */}
        <section className="relative py-28 px-5 sm:px-10 overflow-hidden bg-gradient-to-b from-[#121311] to-[#0B0C0A] text-center border-t border-white/10">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-white tracking-tight leading-[1.12]">
              Дом начинается с тех,{" "}
              <em
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
                className="not-italic text-[#D6FF3F]"
              >
                кто рядом.
              </em>
            </h2>
            <p className="mt-4 text-white/70 text-base md:text-lg max-w-xl mx-auto">
              Sosedi помогает найти жильё, которое подходит вам и вашим людям. Без посредников и лишних комиссии.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/app/roommates"
                className="w-full sm:w-auto bg-[#D6FF3F] hover:bg-[#c4ed27] text-black font-semibold text-sm px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2"
              >
                <span>Подобрать соседей</span>
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/owner/properties/new"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-8 py-3.5 rounded-full backdrop-blur-md transition-all border border-white/10"
              >
                Разместить жильё
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
