export type SocialLinks = {
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  website?: string
}

export type BrandPalette = {
  primary: string
  primaryHover: string
  tint: string
  onPrimary: string
  text: string
  mutedText: string
  surface: string
}

export type SchoolProgram = {
  title: string
  description: string
  icon: string
}

export type Testimonial = {
  quote: string
  name: string
  role: string
  avatar: string
}

export type GalleryItem = {
  src: string
  alt: string
}

export type SimpleSectionCopy = {
  title?: string
  subtitle?: string
}

export type GenericItem = {
  title: string
  description: string
  icon?: string
}

export type FAQItem = {
  question: string
  answer: string
}

export type SchoolProfile = {
  name: string
  shortName: string
  tagline: string
  description: string
  logo: {
    full: string
    mark: string
    favicon: string
  }
  brand: BrandPalette
  navLinks: { label: string; href: string }[]
  hero: {
    heading: string
    body: string
    ctaLabel: string
    ctaHref: string
    images: GalleryItem[]
  }
  programs: SchoolProgram[]
  testimonials: Testimonial[]
  gallery: GalleryItem[]
  cta: {
    heading: string
    body: string
    ctaLabel: string
    ctaHref: string
  }
  contact: {
    office: string
    email: string
    phone: string
    address: string
  }
  sectionsEnabled?: string[]
  sectionsContent?: Record<string, SimpleSectionCopy | undefined>
  features?: GenericItem[]
  facilities?: GenericItem[]
  faqs?: FAQItem[]
  socials: SocialLinks
}

export const defaultSchoolProfile: SchoolProfile = {
  name: "",
  shortName: "",
  tagline: "",
  description: "",
  logo: {
    full: "/assets/logo.png",
    mark: "/assets/logo.svg",
    favicon: "/assets/logo.png",
  },
  // Fallback palette only; real values should come from the school details endpoint
  brand: {
    primary: "#c7363f",
    primaryHover: "#b12f37",
    tint: "#fbe6e9",
    onPrimary: "#ffffff",
    text: "#1f2024",
    mutedText: "#4a4a4a",
    surface: "#fff9f7",
  },
  navLinks: [],
  hero: {
    heading: "",
    body: "",
    ctaLabel: "",
    ctaHref: "",
    images: [],
  },
  programs: [],
  testimonials: [],
  gallery: [],
  cta: {
    heading: "",
    body: "",
    ctaLabel: "",
    ctaHref: "",
  },
  contact: {
    office: "",
    email: "",
    phone: "",
    address: "",
  },
  sectionsEnabled: [],
  sectionsContent: {},
  features: [],
  facilities: [],
  faqs: [],
  socials: {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    website: "",
  },
}
