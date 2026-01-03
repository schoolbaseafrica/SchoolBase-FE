import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { defaultSchoolProfile } from "@/data/school-profile"
import { useIsMobile } from "@/hooks/use-mobile"
import { Check, ChevronsUpDown, Pencil, Plus, Trash } from "lucide-react"
import Image from "next/image"
import { useEffect, useId, useMemo, useState, type JSX } from "react"
import { FormData, LandingSectionKey } from "../_types/setup"
import ProgressIndicator from "./progress-indicator"
import { getPhotoUrl } from "@/lib/api/utils/upload-photo"
import { LANDING_ICON_OPTIONS } from "@/lib/landing-icons"
import { cn } from "@/lib/utils"

type LandingSetupFormProps = {
  formData: FormData
  updateFormData: (section: keyof FormData, field: string, value: unknown) => void
  onSubmit: () => void
  onCancel: () => void
}

const coreSections: LandingSectionKey[] = [
  "hero",
  "programs",
  "gallery",
  "cta",
  "contact",
  "footer",
]
const optionalSections: LandingSectionKey[] = [
  "testimonials",
  "features",
  "facilities",
  "about",
  "whyUs",
  "faq",
]

const sectionLabels: Record<LandingSectionKey, string> = {
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

const sectionAnchors: Record<LandingSectionKey, string> = {
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

const MIN_OPTIONAL_ENABLED = 4
const MIN_LIST_ITEMS = 3
const MAX_LIST_ITEMS = 6
const TITLE_MAX = 80
const BODY_MAX = 320
const SECTION_COPY_MAX = 240
const CTA_LABEL_MAX = 40
const CTA_LINK_MAX = 160
const EMAIL_MAX = 120

const fileListToImages = async (files: FileList) => {
  const uploads = Array.from(files).map(async (file) => {
    try {
      const url = await getPhotoUrl(file)
      return { src: url, alt: file.name }
    } catch (error) {
      console.error("Failed to upload image:", error)
      return { src: "", alt: file.name }
    }
  })
  return Promise.all(uploads)
}

type IconPickerProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

const IconPicker = ({ value, onChange, placeholder }: IconPickerProps) => {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const selected = LANDING_ICON_OPTIONS.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group hover:text-primary w-full justify-between text-sm hover:bg-white"
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <selected.Icon className="h-4 w-4" />
              {selected.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder ?? "Select icon"}</span>
          )}
          <ChevronsUpDown className="group-hover:text-primary ml-2 h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-300 w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandList id={listId}>
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              {LANDING_ICON_OPTIONS.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <option.Icon className="mr-2 h-4 w-4" />
                  {option.label}
                  {option.value === value ? (
                    <Check className="ml-auto h-4 w-4 opacity-80" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function LandingSetupForm({
  formData,
  updateFormData,
  onSubmit,
  onCancel,
}: LandingSetupFormProps) {
  const landing = formData.landing ?? {
    navLinks: defaultSchoolProfile.navLinks,
    hero: defaultSchoolProfile.hero,
    programs: defaultSchoolProfile.programs,
    sections: [],
    sectionsContent: {},
    gallery: defaultSchoolProfile.gallery,
    contact: {
      office: defaultSchoolProfile.contact.office,
      email: defaultSchoolProfile.contact.email,
    },
    cta: defaultSchoolProfile.cta,
    palette: defaultSchoolProfile.brand,
  }

  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState<LandingSectionKey | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const sections = useMemo(() => {
    const existing = landing.sections ?? []
    const allKeys = [...coreSections, ...optionalSections]

    return allKeys.map((key) => {
      const found = existing.find((s) => s.key === key)
      return {
        key,
        enabled: coreSections.includes(key) ? true : (found?.enabled ?? false),
      }
    })
  }, [landing.sections])

  const isNonEmpty = (value?: string | null) => Boolean(value?.trim())
  const hasEmailFormat = (value?: string | null) =>
    Boolean(value?.trim() && /.+@.+\..+/.test(value.trim()))

  const validateList = <T extends { title: string; description: string; icon?: string }>(
    list?: T[]
  ) =>
    (list?.length ?? 0) >= MIN_LIST_ITEMS &&
    (list?.length ?? 0) <= MAX_LIST_ITEMS &&
    (list ?? []).every(
      (item) =>
        isNonEmpty(item.title) && isNonEmpty(item.description) && isNonEmpty(item.icon)
    )

  const validateFaqs = (list?: { question: string; answer: string }[]) =>
    (list?.length ?? 0) > 0 &&
    (list ?? []).every((item) => isNonEmpty(item.question) && isNonEmpty(item.answer))

  const validateTestimonials = (
    list?: { name: string; role: string; quote: string; avatar?: string }[]
  ) =>
    (list?.length ?? 0) > 0 &&
    (list ?? []).every(
      (item) => isNonEmpty(item.name) && isNonEmpty(item.role) && isNonEmpty(item.quote)
    )

  const enabledOptionalSections = sections.filter(
    (s) => s.enabled && !coreSections.includes(s.key)
  )
  const programsValid = validateList(landing.programs)
  const featuresEnabled = sections.find((s) => s.key === "features")?.enabled
  const facilitiesEnabled = sections.find((s) => s.key === "facilities")?.enabled
  const faqEnabled = sections.find((s) => s.key === "faq")?.enabled
  const testimonialsEnabled = sections.find((s) => s.key === "testimonials")?.enabled
  const aboutEnabled = sections.find((s) => s.key === "about")?.enabled
  const whyUsEnabled = sections.find((s) => s.key === "whyUs")?.enabled

  const featuresValid = !featuresEnabled || validateList(landing.features)
  const facilitiesValid = !facilitiesEnabled || validateList(landing.facilities)
  const faqValid = !faqEnabled || validateFaqs(landing.faqs)
  const testimonialsValid =
    !testimonialsEnabled || validateTestimonials(landing.testimonials)
  const aboutValid =
    !aboutEnabled ||
    Boolean(
      isNonEmpty(landing.sectionsContent?.about?.title) ||
        isNonEmpty(landing.sectionsContent?.about?.subtitle)
    )
  const whyUsValid =
    !whyUsEnabled ||
    Boolean(
      isNonEmpty(landing.sectionsContent?.whyUs?.title) ||
        isNonEmpty(landing.sectionsContent?.whyUs?.subtitle)
    )

  const canSave =
    enabledOptionalSections.length >= MIN_OPTIONAL_ENABLED &&
    programsValid &&
    featuresValid &&
    facilitiesValid &&
    faqValid &&
    testimonialsValid &&
    aboutValid &&
    whyUsValid &&
    isNonEmpty(landing.hero.heading || defaultSchoolProfile.hero.heading) &&
    isNonEmpty(landing.hero.body || defaultSchoolProfile.hero.body) &&
    isNonEmpty(landing.hero.ctaLabel || defaultSchoolProfile.hero.ctaLabel) &&
    isNonEmpty(landing.hero.ctaHref || defaultSchoolProfile.hero.ctaHref) &&
    isNonEmpty(landing.cta?.heading || defaultSchoolProfile.cta.heading) &&
    isNonEmpty(landing.cta?.body || defaultSchoolProfile.cta.body) &&
    isNonEmpty(landing.cta?.ctaLabel || defaultSchoolProfile.cta.ctaLabel) &&
    isNonEmpty(landing.cta?.ctaHref || defaultSchoolProfile.cta.ctaHref) &&
    isNonEmpty(landing.contact.office) &&
    hasEmailFormat(landing.contact.email)

  useEffect(() => {
    if (canSave && validationErrors.length) {
      setValidationErrors([])
    }
  }, [canSave, validationErrors.length])

  const updateHero = (field: string, value: string) => {
    updateFormData("landing", "hero", { ...landing.hero, [field]: value })
  }

  const updateCTA = (field: string, value: string) => {
    const next = { ...defaultSchoolProfile.cta, ...(landing.cta ?? {}), [field]: value }
    updateFormData("landing", "cta", next)
  }

  const updateFooter = (
    field: "description" | "facebook" | "instagram" | "linkedin" | "twitter" | "website",
    value: string
  ) => {
    const current = landing.footer ?? { description: "", socials: {} }
    if (field === "description") {
      updateFormData("landing", "footer", { ...current, description: value })
      return
    }
    const socials = { ...(current.socials ?? {}), [field]: value }
    updateFormData("landing", "footer", { ...current, socials })
  }

  const updateSectionContent = (
    key: LandingSectionKey,
    field: "title" | "subtitle",
    value: string
  ) => {
    const current = landing.sectionsContent ?? {}
    const existing = current[key] ?? {}
    updateFormData("landing", "sectionsContent", {
      ...current,
      [key]: { ...existing, [field]: value },
    })
  }

  const updateNavLinks = (
    nextSections: { key: LandingSectionKey; enabled: boolean }[]
  ) => {
    const enabled = nextSections.filter(
      (s) => s.enabled && s.key !== "hero" && s.key !== "cta"
    )
    const nav = enabled.map((s) => ({
      label: sectionLabels[s.key],
      href: `#${sectionAnchors[s.key]}`,
    }))
    updateFormData("landing", "navLinks", nav)
  }

  useEffect(() => {
    if (!landing.sections?.length) {
      updateFormData("landing", "sections", sections)
      updateNavLinks(sections)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landing.sections?.length])

  const toggleOptionalSection = (sectionKey: LandingSectionKey, enabled: boolean) => {
    const updated = sections.map((s) => (s.key === sectionKey ? { ...s, enabled } : s))
    updateFormData("landing", "sections", updated)
    updateNavLinks(updated)
  }

  const handleImagesChange = async (files: FileList | null) => {
    if (!files || !files.length) return
    const images = await fileListToImages(files)
    updateFormData("landing", "hero", { ...landing.hero, images })
  }

  const handleGalleryChange = async (files: FileList | null) => {
    if (!files || !files.length) return
    const gallery = await fileListToImages(files)
    updateFormData("landing", "gallery", gallery)
  }

  const updateContact = (field: "office" | "email", value: string) => {
    updateFormData("landing", "contact", { ...landing.contact, [field]: value })
  }

  const handleTestimonialsAvatar = async (file: File | null, index: number) => {
    if (!file) return
    let uploadedUrl = ""
    try {
      uploadedUrl = await getPhotoUrl(file)
    } catch (error) {
      console.error("Failed to upload testimonial avatar:", error)
      return
    }

    const existing = landing.testimonials ?? []
    const next = existing.map((t, i) => (i === index ? { ...t, avatar: uploadedUrl } : t))
    updateFormData("landing", "testimonials", next)
  }

  const updateArrayItem = (
    key: "programs" | "features" | "facilities" | "faqs" | "testimonials",
    index: number,
    field: string,
    value: string
  ) => {
    const list = (landing[key] ?? []) as unknown[]
    const next = list.map((item, i) =>
      i === index ? { ...(item as object), [field]: value } : item
    )
    updateFormData("landing", key, next)
  }

  const addListItem = (
    key: "programs" | "features" | "facilities" | "faqs" | "testimonials"
  ) => {
    const list = (landing[key] ?? []) as unknown[]
    if (list.length >= MAX_LIST_ITEMS) return

    const blank =
      key === "faqs"
        ? { question: "", answer: "" }
        : key === "testimonials"
          ? { name: "", role: "", quote: "", avatar: "" }
          : { title: "", description: "", icon: "" }

    updateFormData("landing", key, [...list, blank])
  }

  const removeListItem = (key: "programs" | "features" | "facilities", index: number) => {
    const list = (landing[key] ?? []) as unknown[]
    if (list.length <= MIN_LIST_ITEMS) return
    const next = list.filter((_, i) => i !== index)
    updateFormData("landing", key, next)
  }

  const removeFaqOrTestimonial = (key: "faqs" | "testimonials", index: number) => {
    const list = (landing[key] ?? []) as unknown[]
    const next = list.filter((_, i) => i !== index)
    updateFormData("landing", key, next)
  }

  const buildValidationErrors = () => {
    const errors: string[] = []

    if (enabledOptionalSections.length < MIN_OPTIONAL_ENABLED) {
      errors.push(`Select at least ${MIN_OPTIONAL_ENABLED} optional sections.`)
    }

    if (!programsValid) {
      errors.push("Programs: add 3-6 items with title, description, and icon.")
    }

    if (featuresEnabled && !featuresValid) {
      errors.push("Features: add 3-6 items with title, description, and icon.")
    }

    if (facilitiesEnabled && !facilitiesValid) {
      errors.push("Facilities: add 3-6 items with title, description, and icon.")
    }

    if (faqEnabled && !faqValid) {
      errors.push("FAQs: add at least 1 question and answer.")
    }

    if (testimonialsEnabled && !testimonialsValid) {
      errors.push("Testimonials: add name, role, and quote for each item.")
    }

    if (aboutEnabled && !aboutValid) {
      errors.push("About: add a title or subtitle.")
    }

    if (whyUsEnabled && !whyUsValid) {
      errors.push("Why Us: add a title or subtitle.")
    }

    if (!isNonEmpty(landing.hero.heading || defaultSchoolProfile.hero.heading)) {
      errors.push("Hero heading is required.")
    }
    if (!isNonEmpty(landing.hero.body || defaultSchoolProfile.hero.body)) {
      errors.push("Hero subheading is required.")
    }
    if (!isNonEmpty(landing.hero.ctaLabel || defaultSchoolProfile.hero.ctaLabel)) {
      errors.push("Hero CTA label is required.")
    }
    if (!isNonEmpty(landing.hero.ctaHref || defaultSchoolProfile.hero.ctaHref)) {
      errors.push("Hero CTA link is required.")
    }

    if (!isNonEmpty(landing.cta?.heading || defaultSchoolProfile.cta.heading)) {
      errors.push("CTA section title is required.")
    }
    if (!isNonEmpty(landing.cta?.body || defaultSchoolProfile.cta.body)) {
      errors.push("CTA section copy is required.")
    }
    if (!isNonEmpty(landing.cta?.ctaLabel || defaultSchoolProfile.cta.ctaLabel)) {
      errors.push("CTA button label is required.")
    }
    if (!isNonEmpty(landing.cta?.ctaHref || defaultSchoolProfile.cta.ctaHref)) {
      errors.push("CTA button link is required.")
    }

    if (!isNonEmpty(landing.contact.office)) {
      errors.push("Contact office address is required.")
    }
    if (!hasEmailFormat(landing.contact.email)) {
      errors.push("Contact email must be valid.")
    }

    return errors
  }

  const markComplete = () => {
    const errors = buildValidationErrors()
    if (errors.length) {
      setValidationErrors(errors)
      return
    }
    updateFormData("landing", "isComplete", true)
    onSubmit()
  }

  const renderListEditor = (
    key: "programs" | "features" | "facilities",
    label: string
  ) => {
    const list = (landing[key] ?? []) as {
      title: string
      description: string
      icon?: string
    }[]
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            Add between {MIN_LIST_ITEMS} and {MAX_LIST_ITEMS} items.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addListItem(key)}
            disabled={list.length >= MAX_LIST_ITEMS}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {label}
          </Button>
        </div>
        <div className="space-y-3">
          {list.map((item, idx) => (
            <Card key={`${key}-${idx}`}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">#{idx + 1}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={list.length <= MIN_LIST_ITEMS}
                    onClick={() => removeListItem(key, idx)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder={`${label} title`}
                    value={item.title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => updateArrayItem(key, idx, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Textarea
                    placeholder="Short supporting copy"
                    value={item.description}
                    maxLength={BODY_MAX}
                    onChange={(e) =>
                      updateArrayItem(key, idx, "description", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconPicker
                    value={item.icon || ""}
                    onChange={(value) => updateArrayItem(key, idx, "icon", value)}
                    placeholder="Select an icon"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderFaqs = () => {
    const list = landing.faqs ?? []
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            Add common questions families ask.
          </p>
          <Button size="sm" variant="outline" onClick={() => addListItem("faqs")}>
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
          </Button>
        </div>
        <div className="space-y-3">
          {list.map((item, idx) => (
            <Card key={`faq-${idx}`}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">#{idx + 1}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFaqOrTestimonial("faqs", idx)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    placeholder="What makes your school unique?"
                    value={item.question}
                    maxLength={TITLE_MAX}
                    onChange={(e) =>
                      updateArrayItem("faqs", idx, "question", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Answer</Label>
                  <Textarea
                    placeholder="Your concise answer"
                    value={item.answer}
                    maxLength={BODY_MAX}
                    onChange={(e) =>
                      updateArrayItem("faqs", idx, "answer", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderTestimonials = () => {
    const list = landing.testimonials ?? []
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            Collect quotes from parents, students, or staff.
          </p>
          <Button size="sm" variant="outline" onClick={() => addListItem("testimonials")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
        <div className="space-y-3">
          {list.map((item, idx) => (
            <Card key={`testimonial-${idx}`}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">#{idx + 1}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFaqOrTestimonial("testimonials", idx)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Full name"
                      value={item.name}
                      maxLength={TITLE_MAX}
                      onChange={(e) =>
                        updateArrayItem("testimonials", idx, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      placeholder="Parent, Student, Teacher"
                      value={item.role}
                      maxLength={TITLE_MAX}
                      onChange={(e) =>
                        updateArrayItem("testimonials", idx, "role", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Testimonial</Label>
                  <Textarea
                    placeholder="Share their experience..."
                    value={item.quote}
                    maxLength={BODY_MAX}
                    onChange={(e) =>
                      updateArrayItem("testimonials", idx, "quote", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleTestimonialsAvatar(e.target.files?.[0] ?? null, idx)
                    }
                  />
                  {item.avatar && (
                    <Image
                      src={item.avatar}
                      alt={item.name || "Testimonial avatar"}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-12">
      <h1 className="mb-3 text-center text-3xl font-semibold text-gray-900">
        Landing Page Setup
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Configure the sections, copy, and media that will power your school landing page.
      </p>

      <ProgressIndicator currentStep={2} />

      <div className="my-8 space-y-3">
        <div>
          <div className="mb-4 space-y-1">
            <CardTitle>Call To Action</CardTitle>
            <CardDescription>
              Primary CTA text for your hero and dedicated CTA section.
            </CardDescription>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA label</Label>
              <Input
                placeholder="Get in touch"
                value={landing.hero.ctaLabel || defaultSchoolProfile.hero.ctaLabel}
                maxLength={CTA_LABEL_MAX}
                onChange={(e) => updateHero("ctaLabel", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA link</Label>
              <Input
                placeholder="#contact"
                value={landing.hero.ctaHref || defaultSchoolProfile.hero.ctaHref}
                maxLength={CTA_LINK_MAX}
                onChange={(e) => updateHero("ctaHref", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA section title</Label>
              <Input
                placeholder="Join Our School Community"
                value={landing.cta?.heading || defaultSchoolProfile.cta.heading}
                maxLength={TITLE_MAX}
                onChange={(e) => updateCTA("heading", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA section copy</Label>
              <Textarea
                placeholder="Encourage families to reach out."
                value={landing.cta?.body || defaultSchoolProfile.cta.body}
                maxLength={BODY_MAX}
                onChange={(e) => updateCTA("body", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="my-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Sections & Navigation</h3>
            <p className="text-muted-foreground text-sm">
              Select the sections to include; nav links are generated automatically.
              Select a minimum of {MIN_OPTIONAL_ENABLED} sections
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Select sections ({enabledOptionalSections.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {optionalSections.map((key) => {
                const enabled = sections.find((s) => s.key === key)?.enabled ?? false
                return (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      toggleOptionalSection(key, Boolean(checked))
                    }
                  >
                    {sectionLabels[key]}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[...coreSections, ...optionalSections].map((key) => {
            const enabled = sections.find((s) => s.key === key)?.enabled ?? false
            const disabled = !enabled && !coreSections.includes(key)
            return (
              <Card
                key={key}
                className={`border py-0 ${enabled ? "border-primary/60 shadow-sm" : ""}`}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{sectionLabels[key]}</p>
                    <p className="text-muted-foreground text-xs">
                      {coreSections.includes(key)
                        ? "Always on"
                        : enabled
                          ? "Enabled"
                          : "Off"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setActiveSection(key)}
                    disabled={disabled}
                    aria-label={`Edit ${sectionLabels[key]}`}
                    className="group"
                  >
                    <Pencil className="group-hover:text-primary h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-2 md:grid-cols-2 md:gap-4">
        <Button variant="outline" className="px-4 py-3" onClick={onCancel}>
          Back
        </Button>
        <Button className="px-4 py-3" onClick={markComplete}>
          Next
        </Button>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Please fix the following before continuing:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {activeSection &&
        (isMobile ? (
          <Drawer open onOpenChange={(open) => !open && setActiveSection(null)}>
            <DrawerContent className="overflow-y-auto px-4">
              <DrawerHeader>
                <DrawerTitle>{sectionLabels[activeSection]}</DrawerTitle>
                <DrawerDescription className="sr-only">
                  Edit landing section details
                </DrawerDescription>
              </DrawerHeader>
              <SectionContent
                activeSection={activeSection}
                landing={landing}
                updateHero={updateHero}
                updateCTA={updateCTA}
                updateFooter={updateFooter}
                updateSectionContent={updateSectionContent}
                handleImagesChange={handleImagesChange}
                handleGalleryChange={handleGalleryChange}
                updateContact={updateContact}
                renderListEditor={renderListEditor}
                renderFaqs={renderFaqs}
                renderTestimonials={renderTestimonials}
              />
              <Separator className="my-4" />
            </DrawerContent>
          </Drawer>
        ) : (
          <Sheet open onOpenChange={(open) => !open && setActiveSection(null)}>
            <SheetContent side="right" className="w-full max-w-xl overflow-y-auto p-6">
              <div className="border-b pb-4">
                <SheetTitle>{sectionLabels[activeSection]}</SheetTitle>
              </div>
              <SectionContent
                activeSection={activeSection}
                landing={landing}
                updateHero={updateHero}
                updateCTA={updateCTA}
                updateFooter={updateFooter}
                updateSectionContent={updateSectionContent}
                handleImagesChange={handleImagesChange}
                handleGalleryChange={handleGalleryChange}
                updateContact={updateContact}
                renderListEditor={renderListEditor}
                renderFaqs={renderFaqs}
                renderTestimonials={renderTestimonials}
              />
              <Separator className="my-4" />
            </SheetContent>
          </Sheet>
        ))}
    </div>
  )
}

type SectionContentProps = {
  activeSection: LandingSectionKey
  landing: FormData["landing"]
  updateHero: (field: string, value: string) => void
  updateCTA: (field: string, value: string) => void
  updateFooter: (
    field: "description" | "facebook" | "instagram" | "linkedin" | "twitter" | "website",
    value: string
  ) => void
  updateSectionContent: (
    key: LandingSectionKey,
    field: "title" | "subtitle",
    value: string
  ) => void
  handleImagesChange: (files: FileList | null) => void
  handleGalleryChange: (files: FileList | null) => void
  updateContact: (field: "office" | "email", value: string) => void
  renderListEditor: (
    key: "programs" | "features" | "facilities",
    label: string
  ) => JSX.Element
  renderFaqs: () => JSX.Element
  renderTestimonials: () => JSX.Element
}

function SectionContent({
  activeSection,
  landing,
  updateHero,
  updateCTA,
  updateSectionContent,
  handleImagesChange,
  handleGalleryChange,
  updateContact,
  updateFooter,
  renderListEditor,
  renderFaqs,
  renderTestimonials,
}: SectionContentProps) {
  if (activeSection === "hero") {
    return (
      <div className="space-y-3">
        <Label>Heading</Label>
        <Input
          placeholder="Welcome to Green Valley High"
          value={landing.hero.heading || defaultSchoolProfile.hero.heading}
          maxLength={TITLE_MAX}
          onChange={(e) => updateHero("heading", e.target.value)}
        />
        <Label>Subheading</Label>
        <Textarea
          placeholder="Modern learning with real-time updates"
          value={landing.hero.body || defaultSchoolProfile.hero.body}
          maxLength={BODY_MAX}
          onChange={(e) => updateHero("body", e.target.value)}
        />
        <Label>Hero images (3)</Label>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImagesChange(e.target.files)}
        />
        {landing.hero.images?.length ? (
          <div className="grid grid-cols-3 gap-2 pt-2">
            {landing.hero.images.slice(0, 3).map((img) => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                width={160}
                height={80}
                className="h-20 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (activeSection === "gallery") {
    return (
      <div className="space-y-3">
        <Label>Gallery images</Label>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleGalleryChange(e.target.files)}
        />
        <p className="text-muted-foreground text-xs">Pick multiple images at once.</p>
        {landing.gallery?.length ? (
          <div className="grid grid-cols-3 gap-2 pt-2">
            {landing.gallery.map((img, idx) => (
              <Image
                key={`${img.src}-${idx}`}
                src={img.src}
                alt={img.alt}
                width={160}
                height={80}
                className="h-20 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (activeSection === "contact") {
    return (
      <div className="grid gap-3">
        <div>
          <Label>Office</Label>
          <Input
            placeholder="Main campus office"
            value={landing.contact.office}
            maxLength={BODY_MAX}
            onChange={(e) => updateContact("office", e.target.value)}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            placeholder="hello@yourschool.edu"
            value={landing.contact.email}
            maxLength={EMAIL_MAX}
            type="email"
            onChange={(e) => updateContact("email", e.target.value)}
          />
        </div>
      </div>
    )
  }

  if (activeSection === "footer") {
    const socials = landing.footer?.socials ?? {}
    return (
      <div className="space-y-3">
        <Label>Footer description</Label>
        <Textarea
          placeholder="Short summary or tagline for the footer."
          value={landing.footer?.description ?? ""}
          maxLength={BODY_MAX}
          onChange={(e) => updateFooter("description", e.target.value)}
        />
        <Label>Social links</Label>
        <div className="space-y-2">
          <Input
            placeholder="Facebook URL"
            value={socials.facebook ?? ""}
            maxLength={CTA_LINK_MAX}
            onChange={(e) => updateFooter("facebook", e.target.value)}
          />
          <Input
            placeholder="Instagram URL"
            value={socials.instagram ?? ""}
            maxLength={CTA_LINK_MAX}
            onChange={(e) => updateFooter("instagram", e.target.value)}
          />
          <Input
            placeholder="LinkedIn URL"
            value={socials.linkedin ?? ""}
            maxLength={CTA_LINK_MAX}
            onChange={(e) => updateFooter("linkedin", e.target.value)}
          />
          <Input
            placeholder="Twitter/X URL"
            value={socials.twitter ?? ""}
            maxLength={CTA_LINK_MAX}
            onChange={(e) => updateFooter("twitter", e.target.value)}
          />
          <Input
            placeholder="Website URL"
            value={socials.website ?? ""}
            maxLength={CTA_LINK_MAX}
            onChange={(e) => updateFooter("website", e.target.value)}
          />
        </div>
      </div>
    )
  }

  if (activeSection === "cta") {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>CTA label</Label>
          <Input
            placeholder="Talk to admissions"
            value={landing.cta?.ctaLabel || defaultSchoolProfile.cta.ctaLabel}
            maxLength={CTA_LABEL_MAX}
            onChange={(e) => updateCTA("ctaLabel", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA link</Label>
          <Input
            placeholder="#contact"
            value={landing.cta?.ctaHref || defaultSchoolProfile.cta.ctaHref}
            maxLength={CTA_LINK_MAX}
            onChange={(e) => updateCTA("ctaHref", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA title</Label>
          <Input
            placeholder="Join Our School Community"
            value={landing.cta?.heading || defaultSchoolProfile.cta.heading}
            maxLength={TITLE_MAX}
            onChange={(e) => updateCTA("heading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA copy</Label>
          <Textarea
            placeholder="Encourage families to reach out."
            value={landing.cta?.body || defaultSchoolProfile.cta.body}
            maxLength={BODY_MAX}
            onChange={(e) => updateCTA("body", e.target.value)}
          />
        </div>
      </div>
    )
  }

  if (activeSection === "programs") {
    return renderListEditor("programs", "Program")
  }

  if (activeSection === "features") {
    return renderListEditor("features", "Feature")
  }

  if (activeSection === "facilities") {
    return renderListEditor("facilities", "Facility")
  }

  if (activeSection === "faq") {
    return renderFaqs()
  }

  if (activeSection === "testimonials") {
    return renderTestimonials()
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Add headlines and copy for the {sectionLabels[activeSection]} section.
      </p>
      <Label>Title</Label>
      <Input
        placeholder={`${sectionLabels[activeSection]} title`}
        value={landing.sectionsContent?.[activeSection]?.title || ""}
        maxLength={TITLE_MAX}
        onChange={(e) => updateSectionContent(activeSection, "title", e.target.value)}
      />
      <Label>Subtitle</Label>
      <Textarea
        placeholder="Short supporting text"
        value={landing.sectionsContent?.[activeSection]?.subtitle || ""}
        maxLength={SECTION_COPY_MAX}
        onChange={(e) => updateSectionContent(activeSection, "subtitle", e.target.value)}
      />
    </div>
  )
}
