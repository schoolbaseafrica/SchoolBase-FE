import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { HeroSection } from "./_components/hero-section"
import { ProgramsSection } from "./_components/programs-section"
import { TestimonialsSection } from "./_components/testimonials-section"
import { GallerySection } from "./_components/gallery-section"
import { CtaSection } from "./_components/cta-section"
import { ContactSection } from "./_components/contact-section"

export default function ExternalLandingPage() {
  return (
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
  )
}
