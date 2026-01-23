import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { HeroSection } from "@/app/(external)/_components/hero-section"
import { ProgramsSection } from "@/app/(external)/_components/programs-section"
import { TestimonialsSection } from "@/app/(external)/_components/testimonials-section"
import { GallerySection } from "@/app/(external)/_components/gallery-section"
import { CtaSection } from "@/app/(external)/_components/cta-section"
import { ContactSection } from "@/app/(external)/_components/contact-section"
import { LandingPageProvider } from "./_components/landing-page-provider"

/**
 * Landing page - Public-facing school website
 * Only accessible after installation is complete
 */
export default function LandingPage() {
  return (
    <LandingPageProvider>
      <div className="bg-background text-[var(--text-primary)]">
        <Navbar />
        <main className="pt-24">
          <HeroSection />
          <ProgramsSection />
          <TestimonialsSection />
          <GallerySection />
          <CtaSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </LandingPageProvider>
  )
}
