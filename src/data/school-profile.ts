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
  socials: SocialLinks
}

export const defaultSchoolProfile: SchoolProfile = {
  name: "Study Bridge School",
  shortName: "Study Bridge",
  tagline: "Where learning meets technology powered by Study Bridge",
  description:
    "The modern way schools run in Nigeria. Manage attendance, results, timetables, fees, and NFC — all in one place.",
  logo: {
    full: "/assets/logo.png",
    mark: "/assets/logo.svg",
    favicon: "/assets/logo.png",
  },
  brand: {
    primary: "#c7363f",
    primaryHover: "#b12f37",
    tint: "#fbe6e9",
    onPrimary: "#ffffff",
    text: "#1f2024",
    mutedText: "#4a4a4a",
    surface: "#fff9f7",
  },
  navLinks: [
    { label: "Home", href: "#home" },
    { label: "Program", href: "#programs" },
    { label: "Admissions", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    heading: "Welcome to Study Bridge School",
    body: "We give parents real-time access to attendance, grades, fees, and academic updates — all from their mobile device.",
    ctaLabel: "Get In Touch",
    ctaHref: "#contact",
    images: [
      {
        src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561400/user-1_b3c8fs.jpg",
        alt: "Students learning together",
      },
      {
        src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561400/hero_xvc1m6.jpg",
        alt: "Collaborative classroom",
      },
      {
        src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561322/about-1_wcbdkl.jpg",
        alt: "School community",
      },
    ],
  },
  programs: [
    {
      title: "Primary School",
      description: "Strong foundational learning that blends creativity and literacy.",
      icon: "book",
    },
    {
      title: "Junior Secondary",
      description: "Guided discovery learning with STEM-focused projects.",
      icon: "flask",
    },
    {
      title: "Senior Secondary",
      description: "Exam readiness, mentorship, and leadership development.",
      icon: "sparkles",
    },
    {
      title: "Extracurricular Clubs",
      description: "Sports, arts, and STEM clubs that keep students engaged.",
      icon: "users",
    },
    {
      title: "STEM Programs",
      description: "Hands-on labs, robotics, and digital literacy for every learner.",
      icon: "flask",
    },
    {
      title: "Arts & Creativity",
      description: "Music, design, and creative writing to spark imagination.",
      icon: "palette",
    },
  ],
  testimonials: [
    {
      quote:
        "Seeing my child's attendance and results in real time has changed everything for us.",
      name: "Ada Johnson",
      role: "Parent",
      avatar: "/assets/images/auth/user-icon.png",
    },
    {
      quote:
        "Communication is smoother. No more missing reports or fee deadlines — we stay on top of everything.",
      name: "Michael Adeyemi",
      role: "Parent",
      avatar: "/assets/images/auth/user-icon.png",
    },
    {
      quote: "I feel more connected and involved in my child's education every day.",
      name: "Grace Eze",
      role: "Parent",
      avatar: "/assets/images/auth/user-icon.png",
    },
  ],
  gallery: [
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561402/why-choose-4_eq1btu.jpg",
      alt: "Campus exterior",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561401/why-choose-1_elwhbe.jpg",
      alt: "Library study",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561401/user-2_alnxyc.jpg",
      alt: "Creative arts session",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561401/user-4_rrzym7.jpg",
      alt: "Science lab activity",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561400/user-3_p8vypo.jpg",
      alt: "School grounds",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561349/about-2_pfwabt.jpg",
      alt: "Library corner",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561400/hero_xvc1m6.jpg",
      alt: "Collaborative classroom",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561322/about-1_wcbdkl.jpg",
      alt: "School community",
    },
  ],
  cta: {
    heading: "Join Our School Community",
    body: "Ready to give your child the best education?",
    ctaLabel: "Get In Touch",
    ctaHref: "#contact",
  },
  contact: {
    office: "Study Bridge Main Office, Lagos Abuja, Express road.",
    email: "support@studybridgeschool.com",
    phone: "+234 (000) 000 0000",
    address: "Lagos Abuja, Express road.",
  },
  socials: {
    facebook: "https://facebook.com/studybridgeschool",
    instagram: "https://instagram.com/studybridgeschool",
    linkedin: "https://linkedin.com/company/studybridgeschool",
    twitter: "https://x.com/studybridgeschool",
    website: "https://studybridgeschool.com",
  },
}
