import { AboutSection } from "@/components/about-section";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingHero } from "@/components/landing/landing-hero";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { Navbar } from "@/components/navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#0D0D0C] text-white">
      <Navbar />

      <main id="main-content">
        <LandingHero />
        <AboutSection />
        <FeaturesSection />
        <ReviewsSection />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
