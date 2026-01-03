export interface SchoolInfo {
  logo: File | null
  logoPreview?: string | null
  name: string
  brandColor: string
  phone: string
  address: string
  schoolId?: string
}

export interface AdminAccount {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export type LandingSectionKey =
  | "hero"
  | "programs"
  | "features"
  | "facilities"
  | "about"
  | "whyUs"
  | "gallery"
  | "testimonials"
  | "contact"
  | "cta"
  | "faq"
  | "footer"

export interface LandingSectionToggle {
  key: LandingSectionKey
  enabled: boolean
}

export interface LandingPageConfig {
  navLinks: { label: string; href: string }[]
  hero: {
    heading: string
    body: string
    ctaLabel: string
    ctaHref: string
    images: { src: string; alt: string }[]
  }
  programs: { title: string; description: string; icon: string }[]
  features?: { title: string; description: string; icon?: string }[]
  facilities?: { title: string; description: string; icon?: string }[]
  faqs?: { question: string; answer: string }[]
  testimonials?: { name: string; role: string; quote: string; avatar?: string }[]
  cta?: {
    heading?: string
    body?: string
    ctaLabel?: string
    ctaHref?: string
  }
  sections: LandingSectionToggle[]
  sectionsContent?: Partial<
    Record<LandingSectionKey, { title?: string; subtitle?: string }>
  >
  gallery: { src: string; alt: string }[]
  contact: {
    office: string
    email: string
  }
  footer?: {
    description?: string
    socials?: {
      facebook?: string
      instagram?: string
      linkedin?: string
      twitter?: string
      website?: string
    }
  }
  palette: {
    primary: string
    primaryHover: string
    tint: string
    onPrimary: string
    text: string
    mutedText: string
    surface: string
  }
  isComplete?: boolean
}

export interface FormData {
  school: SchoolInfo
  admin: AdminAccount
  landing: LandingPageConfig
  extra?: Record<string, string>
}

export interface Errors {
  [key: string]: string | undefined
}

export interface InstallationStep {
  label: string
  completed: boolean
}
