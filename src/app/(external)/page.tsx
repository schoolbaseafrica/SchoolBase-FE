"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useSchoolStore } from "@/store/use-school-store"
import { HeroSection } from "./_components/hero-section"
import { ProgramsSection } from "./_components/programs-section"
import { TestimonialsSection } from "./_components/testimonials-section"
import { GallerySection } from "./_components/gallery-section"
import { CtaSection } from "./_components/cta-section"
import { ContactSection } from "./_components/contact-section"
import { LandingGate } from "./_components/landing-gate"
import { FeaturesSection } from "./_components/features-section"
import { FacilitiesSection } from "./_components/facilities-section"
import { AboutSection } from "./_components/about-section"
import { WhyUsSection } from "./_components/why-us-section"
import { FaqSection } from "./_components/faq-section"

type SectionKey =
  | "hero"
  | "programs"
  | "features"
  | "facilities"
  | "about"
  | "whyUs"
  | "testimonials"
  | "gallery"
  | "faq"
  | "cta"
  | "contact"

const defaultOrder: SectionKey[] = [
  "hero",
  "programs",
  "features",
  "facilities",
  "about",
  "whyUs",
  "testimonials",
  "gallery",
  "faq",
  "cta",
  "contact",
] as const

export default function ExternalLandingPage() {
  const sectionsEnabled = useSchoolStore((state) => state.school.sectionsEnabled)
  const filtered =
    sectionsEnabled?.filter((key): key is SectionKey =>
      defaultOrder.includes(key as SectionKey)
    ) ?? []
  const order = filtered.length ? filtered : defaultOrder
  const enabled = (key: SectionKey) => order.includes(key)

  return (
    <LandingGate>
      <div className="bg-background text-text-primary">
        <Navbar />
        <main className="pt-24">
          {enabled("hero") && <HeroSection />}
          {enabled("programs") && <ProgramsSection />}
          {enabled("features") && <FeaturesSection />}
          {enabled("facilities") && <FacilitiesSection />}
          {enabled("about") && <AboutSection />}
          {enabled("whyUs") && <WhyUsSection />}
          {enabled("testimonials") && <TestimonialsSection />}
          {enabled("gallery") && <GallerySection />}
          {enabled("faq") && <FaqSection />}
          {enabled("cta") && <CtaSection />}
          {enabled("contact") && <ContactSection />}
        </main>
        <Footer />
      </div>
    </LandingGate>
  )
}
