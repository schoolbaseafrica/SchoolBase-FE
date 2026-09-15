"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mail, MapPin, Menu, Phone, X } from "lucide-react"
import { useState } from "react"
import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import type { MarketingSiteConfig } from "@/data/school-profile"
import { cn } from "@/lib/utils"
import { useSchoolStore } from "@/store/use-school-store"

export type MarketingPage =
  | "home"
  | "about"
  | "academics"
  | "facilities"
  | "gallery"
  | "news"
  | "contact"

const pages: { key: MarketingPage; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/site" },
  { key: "about", label: "About", href: "/site/about" },
  { key: "academics", label: "Academics", href: "/site/academics" },
  { key: "facilities", label: "Facilities", href: "/site/facilities" },
  { key: "gallery", label: "Gallery", href: "/site/gallery" },
  { key: "news", label: "News", href: "/site/news" },
  { key: "contact", label: "Contact", href: "/site/contact" },
]

function SiteImage({
  src,
  alt,
  className,
}: {
  src?: string
  alt: string
  className?: string
}) {
  if (!src) return <div className={cn("bg-accent/10", className)} aria-hidden="true" />
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      className={cn("object-cover", className)}
    />
  )
}

function SiteHeader({ config }: { config: MarketingSiteConfig }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const visiblePages = pages.filter((page) => !config.hiddenPages?.includes(page.key))
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/site">
          <Logo size={34} />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {visiblePages.map((page) => (
            <Link
              key={page.key}
              href={page.href}
              className={cn(
                "hover:text-accent text-sm font-medium transition",
                pathname === page.href ? "text-accent" : "text-gray-600"
              )}
            >
              {config.navigationLabels?.[page.key]?.trim() || page.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button asChild>
            <Link href="/login">Portal login</Link>
          </Button>
        </div>
        <button
          type="button"
          className="rounded-md p-2 lg:hidden"
          aria-label="Open website menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 min-h-screen bg-white p-6 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo size={34} />
            <button
              type="button"
              aria-label="Close website menu"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-2">
            {visiblePages.map((page) => (
              <Link
                key={page.key}
                href={page.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-lg font-medium hover:bg-gray-50"
              >
                {config.navigationLabels?.[page.key]?.trim() || page.label}
              </Link>
            ))}
          </nav>
          <Button asChild className="mt-6 w-full">
            <Link href="/login">Portal login</Link>
          </Button>
        </div>
      )}
    </header>
  )
}

function SiteFooter() {
  const school = useSchoolStore((state) => state.school)
  return (
    <footer className="bg-gray-950 text-white">
      <div className="container grid gap-8 py-12 md:grid-cols-2">
        <div>
          <Logo iconColor="white" textColor="white" size={36} />
          <p className="mt-4 max-w-md text-sm text-white/70">{school.description}</p>
        </div>
        <div className="space-y-3 text-sm md:justify-self-end">
          <a
            className="flex items-center gap-2 text-white/80 hover:text-white"
            href={`mailto:${school.contact.email}`}
          >
            <Mail className="h-4 w-4" />
            {school.contact.email}
          </a>
          <a
            className="flex items-center gap-2 text-white/80 hover:text-white"
            href={`tel:${school.contact.phone}`}
          >
            <Phone className="h-4 w-4" />
            {school.contact.phone}
          </a>
          <p className="flex items-start gap-2 text-white/80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {school.contact.address}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {school.name}. All rights reserved.
      </div>
    </footer>
  )
}

function PageHero({ title, image }: { title: string; image?: string }) {
  return (
    <section className="relative isolate flex min-h-72 items-center overflow-hidden bg-gray-900">
      <SiteImage src={image} alt="" className="absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 bg-gray-950/65" />
      <div className="container py-20">
        <h1 className="max-w-3xl text-4xl font-bold text-white md:text-5xl">{title}</h1>
      </div>
    </section>
  )
}

function HomePage({ config }: { config: MarketingSiteConfig }) {
  const school = useSchoolStore((state) => state.school)
  const facilities = config.home?.facilities?.length
    ? config.home.facilities
    : school.programs.slice(0, 3)
  const facilityImages = config.home?.facilitiesImageUrls || []
  return (
    <>
      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-gray-900">
        <SiteImage
          src={config.home?.heroImageUrl || school.hero.images[0]?.src}
          alt="School campus"
          className="absolute inset-0 -z-20"
        />
        <div className="absolute inset-0 -z-10 bg-gray-950/60" />
        <div className="container py-24 text-white">
          <p className="mb-4 font-semibold tracking-[0.2em] text-white/80 uppercase">
            {config.home?.heroEyebrow || "Welcome to"}
          </p>
          <h1 className="max-w-4xl text-5xl font-bold md:text-7xl">
            {config.home?.heroHeading || school.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/85 md:text-xl">
            {config.home?.heroBody || school.description}
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/site/contact">
              {config.home?.heroCtaLabel || "Contact the school"}
            </Link>
          </Button>
        </div>
      </section>
      <section className="container grid items-center gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="text-accent font-semibold">
            {config.home?.aboutEyebrow || "Our school"}
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            {config.home?.aboutHeading || "Learning, character, and opportunity"}
          </h2>
          <p className="mt-5 leading-7 text-gray-600">
            {config.home?.aboutBody || school.description}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/site/about">Learn about us</Link>
          </Button>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-2xl">
          <SiteImage
            src={config.home?.aboutImageUrl || school.gallery[0]?.src}
            alt={`${school.name} community`}
          />
        </div>
      </section>
      <section className="bg-gray-50 py-20">
        <div className="container">
          <p className="text-accent font-semibold">
            {config.home?.facilitiesEyebrow || "What we offer"}
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {config.home?.facilitiesHeading || "A place for every learner to grow"}
          </h2>
          {config.home?.facilitiesImageUrl && (
            <div className="relative mt-8 h-72 overflow-hidden rounded-2xl md:h-96">
              <SiteImage
                src={config.home.facilitiesImageUrl}
                alt={`${school.name} facilities`}
              />
            </div>
          )}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {facilities.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="overflow-hidden rounded-xl border bg-white"
              >
                {facilityImages[index] && (
                  <div className="relative h-48">
                    <SiteImage
                      src={facilityImages[index]}
                      alt={item.title || `Facility ${index + 1}`}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function AboutPage({ config }: { config: MarketingSiteConfig }) {
  const school = useSchoolStore((state) => state.school)
  return (
    <>
      <PageHero
        title={config.about?.pageTitle || `About ${school.name}`}
        image={config.about?.bannerImageUrl}
      />
      <section className="container grid gap-10 py-20 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-3xl font-bold">
            {config.about?.heading || "Our school community"}
          </h2>
          <p className="mt-5 leading-8 whitespace-pre-line text-gray-600">
            {config.about?.body || school.description}
          </p>
          <p className="mt-5 leading-8 text-gray-600">
            {config.about?.secondaryBody ||
              "We work with families, teachers, and students to create a safe and ambitious environment where every learner can make progress."}
          </p>
        </div>
        <aside className="bg-accent/10 rounded-2xl p-8">
          <h3 className="text-xl font-semibold">
            {config.about?.highlightTitle || "At a glance"}
          </h3>
          <p className="mt-4 text-gray-700">
            {config.about?.highlightBody || school.tagline}
          </p>
          <Button asChild className="mt-6">
            <Link href="/site/contact">{config.about?.ctaLabel || "Speak with us"}</Link>
          </Button>
        </aside>
      </section>
    </>
  )
}

function AcademicsPage({ config }: { config: MarketingSiteConfig }) {
  const school = useSchoolStore((state) => state.school)
  const programs = config.academics?.programs?.length
    ? config.academics.programs
    : school.programs
  return (
    <>
      <PageHero
        title={config.academics?.pageTitle || "Academics"}
        image={config.academics?.bannerImageUrl}
      />
      <section className="container py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold">
            {config.academics?.heading || "Programs built around learners"}
          </h2>
          <p className="mt-4 text-gray-600">
            {config.academics?.introduction ||
              `Explore the learning programs available at ${school.name}.`}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => {
            const image =
              "imageUrl" in program ? program.imageUrl || program.image_url : undefined
            return (
              <article
                key={`${program.title}-${index}`}
                className="overflow-hidden rounded-xl border bg-white"
              >
                <div className="relative h-48">
                  <SiteImage src={image} alt={program.title || "Academic program"} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{program.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {program.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}

function FacilitiesPage({ config }: { config: MarketingSiteConfig }) {
  const school = useSchoolStore((state) => state.school)
  const images = config.facilities?.imageUrls?.length
    ? config.facilities.imageUrls
    : school.gallery.map((item) => item.src)
  return (
    <>
      <PageHero
        title={config.facilities?.pageTitle || "Facilities"}
        image={config.facilities?.bannerImageUrl}
      />
      <section className="container py-20">
        <h2 className="text-3xl font-bold">
          {config.facilities?.heading || "Spaces designed for learning"}
        </h2>
        <p className="mt-4 max-w-2xl text-gray-600">
          {config.facilities?.introduction ||
            "Take a look at the spaces that support daily learning and school life."}
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative h-72 overflow-hidden rounded-xl"
            >
              <SiteImage src={image} alt={`${school.name} facility ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function GalleryPage({ config }: { config: MarketingSiteConfig }) {
  const school = useSchoolStore((state) => state.school)
  const items = config.gallery?.items?.length
    ? config.gallery.items
    : school.gallery.map((item) => ({
        title: item.alt,
        description: undefined,
        imageUrl: item.src,
      }))
  return (
    <>
      <PageHero title={config.gallery?.pageTitle || "Gallery"} />
      <section className="container py-20">
        <h2 className="text-3xl font-bold">
          {config.gallery?.heading || `Life at ${school.name}`}
        </h2>
        {config.gallery?.subtitle && (
          <p className="mt-4 text-gray-600">{config.gallery.subtitle}</p>
        )}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="overflow-hidden rounded-xl border"
            >
              <div className="relative h-64">
                <SiteImage src={item.imageUrl} alt={item.title || "School gallery"} />
              </div>
              {(item.title || item.description) && (
                <div className="p-5">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function NewsPage({ config }: { config: MarketingSiteConfig }) {
  const items = config.news?.items || []
  return (
    <>
      <PageHero
        title={config.news?.pageTitle || "School news"}
        image={config.news?.bannerImageUrl}
      />
      <section className="container py-20">
        <h2 className="text-3xl font-bold">{config.news?.heading || "Latest updates"}</h2>
        {items.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {items.map((item, index) => (
              <article key={item.id || index} className="rounded-xl border p-6">
                <p className="text-sm text-gray-500">{item.date}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-4 line-clamp-5 leading-7 text-gray-600">
                  {item.content}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-xl bg-gray-50 p-10 text-center text-gray-600">
            There are no published updates yet.
          </div>
        )}
      </section>
    </>
  )
}

function ContactPage({ config }: { config: MarketingSiteConfig }) {
  const school = useSchoolStore((state) => state.school)
  return (
    <>
      <PageHero
        title={config.contact?.pageTitle || "Contact us"}
        image={config.contact?.bannerImageUrl}
      />
      <section className="container grid gap-10 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">
            {config.contact?.heading || "We would be happy to hear from you"}
          </h2>
          <p className="mt-4 text-gray-600">
            {config.contact?.introduction ||
              "Contact the school for admissions, visits, and general enquiries."}
          </p>
          <div className="mt-8 space-y-5">
            <a
              className="flex items-center gap-3"
              href={`mailto:${school.contact.email}`}
            >
              <Mail className="text-accent" />
              {school.contact.email}
            </a>
            <a className="flex items-center gap-3" href={`tel:${school.contact.phone}`}>
              <Phone className="text-accent" />
              {school.contact.phone}
            </a>
            <p className="flex items-start gap-3">
              <MapPin className="text-accent mt-0.5 shrink-0" />
              {school.contact.address}
            </p>
          </div>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-2xl">
          <SiteImage
            src={config.contact?.joinUsImageUrl}
            alt={`${school.name} admissions`}
          />
        </div>
      </section>
    </>
  )
}

export function MarketingSitePage({ page }: { page: MarketingPage }) {
  const school = useSchoolStore((state) => state.school)
  const config = school.marketingSiteConfig || {}
  const content =
    page === "home" ? (
      <HomePage config={config} />
    ) : page === "about" ? (
      <AboutPage config={config} />
    ) : page === "academics" ? (
      <AcademicsPage config={config} />
    ) : page === "facilities" ? (
      <FacilitiesPage config={config} />
    ) : page === "gallery" ? (
      <GalleryPage config={config} />
    ) : page === "news" ? (
      <NewsPage config={config} />
    ) : (
      <ContactPage config={config} />
    )
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <SiteHeader config={config} />
      <main>{content}</main>
      <SiteFooter />
    </div>
  )
}
