"use client"

import Image from "next/image"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { useSchoolStore } from "@/store/use-school-store"
import { defaultSchoolProfile, type SchoolProfile } from "@/data/school-profile"
import { type LandingPageConfig } from "@/app/(portal)/setup/_types/setup"
import { LandingPageAPI, mapLandingPageResponse } from "@/lib/api/landing-page"
import { SetupWizardAPI } from "@/lib/api/setup/super-admin-setup-apis"

type LandingGateProps = {
  children: ReactNode
}

const heroFallbackImages = [
  {
    src: "https://res.cloudinary.com/demo/image/upload/v1720000000/samples/people/boy-snow-hoodie.jpg",
    alt: "Students learning together",
  },
  {
    src: "https://res.cloudinary.com/demo/image/upload/v1720000000/samples/people/kitchen-bar.jpg",
    alt: "Collaborative classroom",
  },
  {
    src: "https://res.cloudinary.com/demo/image/upload/v1720000000/samples/landscapes/architecture-signs.jpg",
    alt: "School community",
  },
]

const galleryFallbackImages = [
  {
    src: "https://res.cloudinary.com/demo/image/upload/v1720000000/samples/people/bicycle.jpg",
    alt: "Campus exterior",
  },
  {
    src: "https://res.cloudinary.com/demo/image/upload/v1720000000/samples/landscapes/beach-house.jpg",
    alt: "Library study",
  },
  {
    src: "https://res.cloudinary.com/demo/image/upload/v1720000000/samples/landscapes/nature-mountains.jpg",
    alt: "STEM lab",
  },
]

const heroTextFallback = {
  heading: "Welcome to our school",
  body: "Modern learning, transparent updates, and a supportive community.",
  ctaLabel: "Get in touch",
  ctaHref: "#contact",
}

const coreSections = ["hero", "programs", "gallery", "cta", "contact", "footer"] as const
const optionalSections = [
  "testimonials",
  "features",
  "facilities",
  "about",
  "whyUs",
  "faq",
] as const

const sectionLabels: Record<string, string> = {
  hero: "Hero",
  programs: "Programs",
  about: "About",
  features: "Features",
  whyUs: "Why Choose Us",
  gallery: "Gallery",
  testimonials: "Testimonials",
  contact: "Contact",
  cta: "Call to Action",
  faq: "FAQs",
  facilities: "Facilities",
  footer: "Footer",
}

const sectionAnchors: Record<string, string> = {
  hero: "home",
  programs: "programs",
  about: "about",
  features: "features",
  whyUs: "why-us",
  gallery: "gallery",
  testimonials: "testimonials",
  contact: "contact",
  cta: "cta",
  faq: "faq",
  facilities: "facilities",
  footer: "footer",
}

const deriveSections = (landing: LandingPageConfig) => {
  const hasList = <T,>(list?: T[]) => (list?.length ?? 0) > 0
  const hasCopy = (copy?: { title?: string; subtitle?: string }) =>
    Boolean(copy?.title || copy?.subtitle)

  const enabled = new Map<string, boolean>()
  coreSections.forEach((key) => enabled.set(key, true))
  enabled.set("features", hasList(landing.features))
  enabled.set("facilities", hasList(landing.facilities))
  enabled.set("testimonials", hasList(landing.testimonials))
  enabled.set("faq", hasList(landing.faqs))
  enabled.set("about", hasCopy(landing.sectionsContent?.about))
  enabled.set("whyUs", hasCopy(landing.sectionsContent?.whyUs))

  const allKeys = [...coreSections, ...optionalSections]
  return allKeys.map((key) => ({ key, enabled: enabled.get(key) ?? false }))
}

const buildNavLinks = (sections: { key: string; enabled: boolean }[]) =>
  sections
    .filter((s) => s.enabled && s.key !== "hero" && s.key !== "cta")
    .map((s) => ({
      label: sectionLabels[s.key] ?? s.key,
      href: `#${sectionAnchors[s.key] ?? s.key}`,
    }))

export function LandingGate({ children }: LandingGateProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const school = useSchoolStore((state) => state.school)
  const setSchool = useSchoolStore((state) => state.setSchool)
  const mergedSchool = useMemo(() => school, [school])

  useEffect(() => {
    if (typeof window === "undefined") return
    const hydrate = async () => {
      try {
        const status = await SetupWizardAPI.getSetupStatus()
        if (!status.data.is_complete) {
          setAllowed(false)
          setHydrated(true)
          return
        }

        const schoolId = status.data.school_id
        if (!schoolId) {
          setAllowed(false)
          setHydrated(true)
          return
        }

        const response = await LandingPageAPI.getLandingPage(schoolId)
        const landing = mapLandingPageResponse(response)
        const sections = deriveSections(landing)
        const enabledSections = sections.filter((s) => s.enabled).map((s) => s.key)
        const navLinks = buildNavLinks(sections)

        const heroImages = landing.hero?.images?.filter(
          (img: { src?: string }) => img?.src
        )?.length
          ? landing.hero.images
          : heroFallbackImages

        const galleryImages = landing.gallery?.filter((img: { src?: string }) => img?.src)
          ?.length
          ? landing.gallery
          : galleryFallbackImages

        const safeNav = navLinks.filter((link) => {
          if (!link.href || !link.label) return false
          const href = link.href.trim()
          if (!href) return false
          const hrefLower = href.toLowerCase()
          if (hrefLower === "#home" || hrefLower === "#cta") return false
          return true
        })

        const updated: SchoolProfile = {
          ...mergedSchool,
          navLinks: safeNav.length ? safeNav : mergedSchool.navLinks,
          hero: landing.hero
            ? {
                ...heroTextFallback,
                ...mergedSchool.hero,
                ...landing.hero,
                images: heroImages,
                ctaHref: landing.hero.ctaHref || heroTextFallback.ctaHref,
                ctaLabel: landing.hero.ctaLabel || heroTextFallback.ctaLabel,
              }
            : {
                ...heroTextFallback,
                ...mergedSchool.hero,
                images: heroImages,
              },
          programs: landing.programs ?? mergedSchool.programs,
          testimonials:
            (landing.testimonials?.length ?? 0) > 0
              ? (landing.testimonials as SchoolProfile["testimonials"])
              : mergedSchool.testimonials,
          gallery: galleryImages,
          cta: landing.cta
            ? {
                heading: landing.cta.heading ?? heroTextFallback.heading,
                body: landing.cta.body ?? heroTextFallback.body,
                ctaLabel: landing.cta.ctaLabel ?? heroTextFallback.ctaLabel,
                ctaHref: landing.cta.ctaHref || heroTextFallback.ctaHref,
              }
            : {
                heading: heroTextFallback.heading,
                body: heroTextFallback.body,
                ctaLabel: heroTextFallback.ctaLabel,
                ctaHref: heroTextFallback.ctaHref,
              },
          sectionsEnabled: enabledSections,
          sectionsContent: landing.sectionsContent ?? mergedSchool.sectionsContent,
          features: landing.features ?? mergedSchool.features,
          facilities: landing.facilities ?? mergedSchool.facilities,
          faqs: landing.faqs ?? mergedSchool.faqs,
          contact: {
            ...mergedSchool.contact,
            office: landing.contact?.office ?? mergedSchool.contact.office,
            email: landing.contact?.email ?? mergedSchool.contact.email,
          },
          brand: landing.palette ?? mergedSchool.brand,
          socials: landing.footer?.socials ?? mergedSchool.socials,
          description: landing.footer?.description ?? mergedSchool.description,
        }
        setSchool(updated)
        // apply brand colors to CSS variables for landing
        if (updated.brand?.primary) {
          const root = document.documentElement
          root.style.setProperty("--primary", updated.brand.primary)
          root.style.setProperty("--primary-hover", updated.brand.primaryHover)
          root.style.setProperty("--tint", updated.brand.tint)
          root.style.setProperty("--on-primary", updated.brand.onPrimary)
          root.style.setProperty("--text-primary", updated.brand.text)
          root.style.setProperty("--text-secondary", updated.brand.mutedText)
          root.style.setProperty("--sidebar", updated.brand.surface)
          root.style.setProperty("--accent", updated.brand.primary)
        }
        setAllowed(enabledSections.length > 0)
      } catch (error) {
        const message = error instanceof Error ? error.message : ""
        if (message) {
          console.error("Landing page fetch failed:", message)
        }
        setAllowed(false)
      } finally {
        setHydrated(true)
      }
    }

    void hydrate()
  }, [mergedSchool, setSchool])

  if (!hydrated) {
    return (
      <div className="bg-sidebar flex min-h-screen flex-col items-center justify-center gap-4">
        <Image
          src={defaultSchoolProfile.logo.mark || "/assets/logo.svg"}
          alt="SchoolBase Logo"
          width={64}
          height={64}
        />
        <div className="text-text-secondary text-center">
          Checking landing page setup…
        </div>
      </div>
    )
  }

  if (allowed === null) {
    return (
      <div className="bg-sidebar flex min-h-screen flex-col items-center justify-center gap-4">
        <Image
          src={defaultSchoolProfile.logo.mark || "/assets/logo.svg"}
          alt="SchoolBase Logo"
          width={64}
          height={64}
        />
        <div className="text-text-secondary text-center">
          Checking landing page setup…
        </div>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FEF9FA] px-4">
        <section className="container grid grid-cols-1 items-center gap-5 align-middle lg:grid-cols-2 lg:gap-[76px]">
          <div className="relative order-1 flex justify-center lg:order-2">
            <Image
              src="/assets/images/not-found.png"
              alt="Not ready illustration"
              width={500}
              height={500}
              loading="eager"
              className="h-auto w-full max-w-[420px]"
            />
          </div>
          <div className="order-2 mx-auto flex max-w-[526px] flex-col gap-2 lg:order-1">
            <h2 className="text-primary text-center text-3xl font-bold lg:text-left lg:text-5xl">
              Oops....
            </h2>
            <p className="text-center text-2xl lg:text-left lg:text-[40px]">
              Landing page not ready
            </p>
            <p className="text-text-secondary text-center text-base sm:text-lg lg:text-left">
              Your school&apos;s landing experience is still being set up. Please visit
              the admin setup to finish configuration before this page goes live.
            </p>
          </div>
        </section>
      </div>
    )
  }

  return <>{children}</>
}
