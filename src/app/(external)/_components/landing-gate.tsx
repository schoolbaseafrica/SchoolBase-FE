"use client"

import Image from "next/image"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { useSchoolStore } from "@/store/use-school-store"
import { defaultSchoolProfile, type SchoolProfile } from "@/data/school-profile"
import { type LandingPageConfig } from "@/app/(portal)/setup/_types/setup"

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

const LANDING_DB = "LandingConfigDB"
const LANDING_STORE = "LandingStore"
const LANDING_KEY = "landing-config"

function openLandingDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LANDING_DB, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(LANDING_STORE)) {
        db.createObjectStore(LANDING_STORE)
      }
    }
  })
}

async function readLandingFromIndexedDb<T>(): Promise<T | undefined> {
  try {
    const db = await openLandingDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(LANDING_STORE, "readonly")
      const request = tx.objectStore(LANDING_STORE).get(LANDING_KEY)
      request.onsuccess = () => resolve(request.result as T | undefined)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.warn("IndexedDB read failed", error)
    return undefined
  }
}

const heroTextFallback = {
  heading: "Welcome to our school",
  body: "Modern learning, transparent updates, and a supportive community.",
  ctaLabel: "Get in touch",
  ctaHref: "#contact",
}

export function LandingGate({ children }: LandingGateProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const school = useSchoolStore((state) => state.school)
  const setSchool = useSchoolStore((state) => state.setSchool)
  const mergedSchool = useMemo(() => school, [school])

  useEffect(() => {
    if (typeof window === "undefined") return
    const hydrate = async () => {
      const completeFlag = localStorage.getItem("landing-setup-complete") === "true"
      const stored =
        (await readLandingFromIndexedDb<
          { landing?: LandingPageConfig } | LandingPageConfig
        >()) ??
        (() => {
          const raw = localStorage.getItem("landing-config")
          if (!raw) return undefined
          try {
            return JSON.parse(raw)
          } catch {
            return undefined
          }
        })()

      if (!stored) {
        setAllowed(completeFlag)
        setHydrated(true)
        return
      }

      try {
        const landing: LandingPageConfig =
          (stored as { landing?: LandingPageConfig }).landing ??
          (stored as LandingPageConfig)
        const enabledSections = (landing.sections ?? [])
          .filter((s: { enabled: boolean }) => s.enabled)
          .map((s: { key: string }) => s.key)

        const heroImages = landing.hero?.images?.filter(
          (img: { src?: string }) => img?.src
        )?.length
          ? landing.hero.images
          : heroFallbackImages

        const galleryImages = landing.gallery?.filter((img: { src?: string }) => img?.src)
          ?.length
          ? landing.gallery
          : galleryFallbackImages

        const safeNav = (landing.navLinks ?? []).filter((link) => {
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
        setAllowed(completeFlag || landing.isComplete || enabledSections.length > 0)
      } catch {
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
            <h2 className="text-primary text-center text-2xl font-bold lg:text-left lg:text-5xl">
              Oops....
            </h2>
            <p className="text-center text-2xl lg:text-left lg:text-[40px]">
              Landing page not ready
            </p>
            <p className="text-text-secondary text-center text-base lg:text-left">
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
