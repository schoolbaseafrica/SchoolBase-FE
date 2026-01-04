import { apiFetch } from "@/lib/api/client"
import type { LandingPageConfig } from "@/app/(portal)/setup/_types/setup"

type ApiImage = { src: string; alt: string }
type ApiProgram = { title: string; description: string; icon?: string }
type ApiFeature = { title: string; description: string; icon?: string }
type ApiFacility = { title: string; description: string; icon?: string }
type ApiFaq = { question: string; answer: string }
type ApiTestimonial = {
  fname: string
  lname: string
  role: string
  quote: string
  avatar?: string
}
type ApiSocials = {
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  website?: string
}
type ApiSchool = {
  id?: string
  name?: string
  address?: string
  phone?: string
  logo_url?: string | null
  primary_color?: string
  secondary_color?: string
  accent_color?: string
}

export type LandingPageApiPayload = {
  school_id: string
  hero: {
    heading: string
    body: string
    cta_label: string
    cta_href: string
    images: ApiImage[]
  }
  programs: ApiProgram[]
  features?: ApiFeature[]
  facilities?: ApiFacility[]
  about?: string
  why_us?: string
  gallery: ApiImage[]
  testimonials?: ApiTestimonial[]
  faqs?: ApiFaq[]
  cta?: {
    heading?: string
    body?: string
    cta_label?: string
    cta_href?: string
  }
  contact: {
    office: string
    email: string
  }
  footer?: {
    description?: string
    socials?: ApiSocials
  }
  palette: {
    primary: string
    primary_hover: string
    tint: string
    on_primary: string
    text: string
    muted_text: string
    surface: string
  }
}

export type LandingPageApiResponse = LandingPageApiPayload & {
  id?: string
  school?: ApiSchool
}

export type LandingPageCreateResponse = {
  school_id: string
}

type LandingPageEnvelope<T> = {
  status_code: number
  message: string
  data: T
}

const splitName = (fullName: string) => {
  const trimmed = fullName.trim()
  if (!trimmed) return { fname: "", lname: "" }
  const parts = trimmed.split(/\s+/)
  const fname = parts.shift() ?? ""
  const lname = parts.join(" ").trim()
  return { fname, lname }
}

const joinName = (fname?: string, lname?: string) =>
  [fname, lname].filter(Boolean).join(" ").trim()

const toSectionCopy = (text?: string) => ({
  title: "",
  subtitle: text ?? "",
})

export const mapLandingPageResponse = (
  payload: LandingPageApiResponse
): LandingPageConfig => {
  const aboutCopy = toSectionCopy(payload.about)
  const whyUsCopy = toSectionCopy(payload.why_us)

  return {
    navLinks: [],
    hero: {
      heading: payload.hero.heading,
      body: payload.hero.body,
      ctaLabel: payload.hero.cta_label,
      ctaHref: payload.hero.cta_href,
      images: payload.hero.images ?? [],
    },
    programs: (payload.programs ?? []).map((program) => ({
      ...program,
      icon: program.icon ?? "",
    })),
    features: payload.features ?? [],
    facilities: payload.facilities ?? [],
    faqs: payload.faqs ?? [],
    testimonials: (payload.testimonials ?? []).map((t) => ({
      name: joinName(t.fname, t.lname),
      role: t.role,
      quote: t.quote,
      avatar: t.avatar ?? "",
    })),
    cta: payload.cta
      ? {
          heading: payload.cta.heading ?? "",
          body: payload.cta.body ?? "",
          ctaLabel: payload.cta.cta_label ?? "",
          ctaHref: payload.cta.cta_href ?? "",
        }
      : undefined,
    sections: [],
    sectionsContent: {
      about: aboutCopy,
      whyUs: whyUsCopy,
    },
    gallery: payload.gallery ?? [],
    contact: {
      office: payload.contact?.office ?? "",
      email: payload.contact?.email ?? "",
    },
    footer: payload.footer
      ? {
          description: payload.footer.description ?? "",
          socials: payload.footer.socials ?? {},
        }
      : undefined,
    palette: {
      primary: payload.palette.primary,
      primaryHover: payload.palette.primary_hover,
      tint: payload.palette.tint,
      onPrimary: payload.palette.on_primary,
      text: payload.palette.text,
      mutedText: payload.palette.muted_text,
      surface: payload.palette.surface,
    },
    isComplete: true,
  }
}

export const toLandingPagePayload = (
  schoolId: string,
  landing: LandingPageConfig
): LandingPageApiPayload => {
  const about = landing.sectionsContent?.about?.subtitle?.trim()
  const whyUs = landing.sectionsContent?.whyUs?.subtitle?.trim()

  return {
    school_id: schoolId,
    hero: {
      heading: landing.hero.heading,
      body: landing.hero.body,
      cta_label: landing.hero.ctaLabel,
      cta_href: landing.hero.ctaHref,
      images: landing.hero.images ?? [],
    },
    programs: landing.programs ?? [],
    features: landing.features ?? [],
    facilities: landing.facilities ?? [],
    about: about || undefined,
    why_us: whyUs || undefined,
    gallery: landing.gallery ?? [],
    testimonials: (landing.testimonials ?? []).map((t) => {
      const { fname, lname } = splitName(t.name)
      return {
        fname,
        lname,
        role: t.role,
        quote: t.quote,
        avatar: t.avatar,
      }
    }),
    faqs: landing.faqs ?? [],
    cta: landing.cta
      ? {
          heading: landing.cta.heading,
          body: landing.cta.body,
          cta_label: landing.cta.ctaLabel,
          cta_href: landing.cta.ctaHref,
        }
      : undefined,
    contact: {
      office: landing.contact?.office ?? "",
      email: landing.contact?.email ?? "",
    },
    footer: landing.footer
      ? {
          description: landing.footer.description ?? "",
          socials: landing.footer.socials ?? {},
        }
      : undefined,
    palette: {
      primary: landing.palette.primary,
      primary_hover: landing.palette.primaryHover,
      tint: landing.palette.tint,
      on_primary: landing.palette.onPrimary,
      text: landing.palette.text,
      muted_text: landing.palette.mutedText,
      surface: landing.palette.surface,
    },
  }
}

export const LandingPageAPI = {
  createLandingPage: (schoolId: string, landing: LandingPageConfig) =>
    apiFetch<LandingPageEnvelope<LandingPageCreateResponse>>(
      "/landing-page",
      {
        method: "POST",
        data: toLandingPagePayload(schoolId, landing),
      },
      true
    ).then((res) => res.data),

  getLandingPage: (schoolId: string) =>
    apiFetch<LandingPageEnvelope<LandingPageApiResponse>>(
      `/landing-page/${schoolId}`,
      {
        method: "GET",
      },
      true
    ).then((res) => res.data),

  updateLandingPage: (schoolId: string, landing: LandingPageConfig) =>
    apiFetch<LandingPageEnvelope<LandingPageApiResponse>>(
      `/landing-page/${schoolId}`,
      {
        method: "PATCH",
        data: toLandingPagePayload(schoolId, landing),
      },
      true
    ).then((res) => res.data),
}
