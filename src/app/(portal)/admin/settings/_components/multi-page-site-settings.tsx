"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ExternalLink, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ImageUploaderWithCrop } from "@/components/image-upload/image-uploader-with-crop"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { MarketingSiteConfig } from "@/data/school-profile"
import { saveMarketingSiteConfig } from "@/lib/marketing-site"
import { cn } from "@/lib/utils"
import { useSchoolStore } from "@/store/use-school-store"

type Section =
  | "pages"
  | "home"
  | "about"
  | "academics"
  | "facilities"
  | "gallery"
  | "news"
  | "contact"

const sections: { key: Section; label: string }[] = [
  { key: "pages", label: "Pages" },
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "academics", label: "Academics" },
  { key: "facilities", label: "Facilities" },
  { key: "gallery", label: "Gallery" },
  { key: "news", label: "News" },
  { key: "contact", label: "Contact" },
]

const websitePages = sections.filter(
  (section): section is { key: Exclude<Section, "pages">; label: string } =>
    section.key !== "pages"
)

function validateConfig(
  config: MarketingSiteConfig
): { section: Section; message: string } | null {
  const incompleteHighlight = config.home?.facilities?.find(
    (item) => !item.title?.trim() || !item.description?.trim()
  )
  if (incompleteHighlight) {
    return {
      section: "home",
      message: "Give every Home facility highlight a title and description.",
    }
  }

  const incompleteProgram = config.academics?.programs?.find(
    (item) => !item.title?.trim() || !item.description?.trim()
  )
  if (incompleteProgram) {
    return {
      section: "academics",
      message: "Give every academic program a name and description.",
    }
  }

  if (config.facilities?.imageUrls?.some((url) => !url.trim())) {
    return {
      section: "facilities",
      message: "Upload or remove each empty facility image before saving.",
    }
  }

  const incompleteGalleryItem = config.gallery?.items?.find(
    (item) => !item.title?.trim() || !item.imageUrl?.trim()
  )
  if (incompleteGalleryItem) {
    return {
      section: "gallery",
      message: "Give every gallery item a title and image.",
    }
  }

  const incompleteNewsItem = config.news?.items?.find(
    (item) => !item.title?.trim() || !item.content?.trim()
  )
  if (incompleteNewsItem) {
    return {
      section: "news",
      message: "Give every news post a title and content.",
    }
  }

  return null
}

function ImageField({
  label,
  description,
  value,
  onChange,
  disabled,
  aspectRatio = 16 / 9,
}: {
  label: string
  description: string
  value?: string
  onChange: (url: string) => void
  disabled: boolean
  aspectRatio?: number
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>{label}</Label>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <ImageUploaderWithCrop
        currentImageUrl={value}
        onImageUploaded={(url) => onChange(url)}
        aspectRatio={aspectRatio}
        minDimensions={
          aspectRatio > 1.5 ? { width: 1200, height: 675 } : { width: 800, height: 600 }
        }
        maxFileSizeMB={2}
        disabled={disabled}
        label={`Upload ${label.toLowerCase()}`}
        description={description}
      />
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value?: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input value={value || ""} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  )
}

function PageTextPanel({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 rounded-xl border bg-gray-50/50 p-5">
      <div>
        <h3 className="font-semibold text-gray-900">Page text</h3>
        <p className="mt-1 text-sm text-gray-500">
          Leave a field empty to keep the current default wording.
        </p>
      </div>
      {children}
    </div>
  )
}

export function MultiPageSiteSettings() {
  const storedConfig = useSchoolStore((state) => state.school.marketingSiteConfig)
  const updateSchool = useSchoolStore((state) => state.updateSchool)
  const [publishedConfig, setPublishedConfig] = useState<MarketingSiteConfig>(
    storedConfig || {}
  )
  const [config, setConfig] = useState<MarketingSiteConfig>(storedConfig || {})
  const [activeSection, setActiveSection] = useState<Section>("pages")
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isDirty) return
    const next = storedConfig || {}
    setPublishedConfig(next)
    setConfig(next)
  }, [storedConfig, isDirty])

  useEffect(() => {
    if (!isDirty) return
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warnBeforeLeaving)
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving)
  }, [isDirty])

  const change = (next: MarketingSiteConfig) => {
    setConfig(next)
    setIsDirty(true)
  }

  const save = async () => {
    const validationError = validateConfig(config)
    if (validationError) {
      setActiveSection(validationError.section)
      toast.error(validationError.message)
      return
    }

    setIsSaving(true)
    try {
      const saved = await saveMarketingSiteConfig(config)
      setConfig(saved)
      setPublishedConfig(saved)
      updateSchool({ marketingSiteConfig: saved })
      setIsDirty(false)
      toast.success("Multi-page website saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the website")
    } finally {
      setIsSaving(false)
    }
  }

  const reset = () => {
    setConfig(publishedConfig)
    setIsDirty(false)
  }

  const setPageVisible = (page: string, visible: boolean) => {
    const hidden = new Set(config.hiddenPages || [])
    if (visible) hidden.delete(page)
    else hidden.add(page)
    change({ ...config, hiddenPages: Array.from(hidden) })
  }

  const home = config.home || {}
  const academics = config.academics || {}
  const facilities = config.facilities || {}
  const gallery = config.gallery || {}
  const news = config.news || {}
  const contact = config.contact || {}
  const about = config.about || {}

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Multi-page website content</CardTitle>
          <CardDescription className="mt-1 max-w-2xl">
            Edit each public page, choose which pages appear in navigation, then save all
            changes together.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDirty ? (
            <Button type="button" variant="outline" disabled>
              Save before preview
            </Button>
          ) : (
            <Button type="button" variant="outline" asChild>
              <a href="/site" target="_blank" rel="noreferrer">
                Preview published site <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={!isDirty || isSaving}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Discard
          </Button>
          <Button type="button" onClick={save} disabled={!isDirty || isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isDirty && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You have unpublished changes. Save before opening the preview.
          </div>
        )}

        <div
          className="flex flex-wrap gap-2 border-b pb-4"
          role="tablist"
          aria-label="Website pages"
        >
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              role="tab"
              aria-selected={activeSection === section.key}
              onClick={() => setActiveSection(section.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                activeSection === section.key
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === "pages" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Navigation pages</h3>
              <p className="mt-1 text-sm text-gray-500">
                Home is always available. Hidden pages keep their saved content and can be
                shown again later.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {websitePages.map((page) => {
                const isHome = page.key === "home"
                const visible = !(config.hiddenPages || []).includes(page.key)
                return (
                  <div key={page.key} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`page-${page.key}`} className="font-medium">
                        {page.label}
                      </Label>
                      <Switch
                        id={`page-${page.key}`}
                        checked={isHome || visible}
                        disabled={isHome}
                        onCheckedChange={(checked) => setPageVisible(page.key, checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`navigation-label-${page.key}`}>
                        Navigation label
                      </Label>
                      <Input
                        id={`navigation-label-${page.key}`}
                        placeholder={page.label}
                        value={config.navigationLabels?.[page.key] || ""}
                        onChange={(event) =>
                          change({
                            ...config,
                            navigationLabels: {
                              ...config.navigationLabels,
                              [page.key]: event.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeSection === "home" && (
          <div className="space-y-8">
            <PageTextPanel>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Hero eyebrow"
                  value={home.heroEyebrow}
                  onChange={(heroEyebrow) =>
                    change({ ...config, home: { ...home, heroEyebrow } })
                  }
                />
                <TextField
                  label="Hero heading"
                  value={home.heroHeading}
                  onChange={(heroHeading) =>
                    change({ ...config, home: { ...home, heroHeading } })
                  }
                />
                <div className="md:col-span-2">
                  <TextField
                    label="Hero introduction"
                    value={home.heroBody}
                    multiline
                    onChange={(heroBody) =>
                      change({ ...config, home: { ...home, heroBody } })
                    }
                  />
                </div>
                <TextField
                  label="Hero button label"
                  value={home.heroCtaLabel}
                  onChange={(heroCtaLabel) =>
                    change({ ...config, home: { ...home, heroCtaLabel } })
                  }
                />
                <TextField
                  label="About eyebrow"
                  value={home.aboutEyebrow}
                  onChange={(aboutEyebrow) =>
                    change({ ...config, home: { ...home, aboutEyebrow } })
                  }
                />
                <TextField
                  label="About heading"
                  value={home.aboutHeading}
                  onChange={(aboutHeading) =>
                    change({ ...config, home: { ...home, aboutHeading } })
                  }
                />
                <TextField
                  label="About introduction"
                  value={home.aboutBody}
                  multiline
                  onChange={(aboutBody) =>
                    change({ ...config, home: { ...home, aboutBody } })
                  }
                />
                <TextField
                  label="Facilities eyebrow"
                  value={home.facilitiesEyebrow}
                  onChange={(facilitiesEyebrow) =>
                    change({ ...config, home: { ...home, facilitiesEyebrow } })
                  }
                />
                <TextField
                  label="Facilities heading"
                  value={home.facilitiesHeading}
                  onChange={(facilitiesHeading) =>
                    change({ ...config, home: { ...home, facilitiesHeading } })
                  }
                />
              </div>
            </PageTextPanel>
            <div className="grid gap-6 lg:grid-cols-3">
              <ImageField
                label="Hero image"
                description="Large image at the top of Home."
                value={home.heroImageUrl}
                disabled={isSaving}
                onChange={(heroImageUrl) =>
                  change({ ...config, home: { ...home, heroImageUrl } })
                }
              />
              <ImageField
                label="About image"
                description="Image beside the school introduction."
                value={home.aboutImageUrl}
                disabled={isSaving}
                onChange={(aboutImageUrl) =>
                  change({ ...config, home: { ...home, aboutImageUrl } })
                }
              />
              <ImageField
                label="Facilities section image"
                description="Wide image above the Home facility highlights."
                value={home.facilitiesImageUrl}
                disabled={isSaving}
                onChange={(facilitiesImageUrl) =>
                  change({ ...config, home: { ...home, facilitiesImageUrl } })
                }
              />
            </div>
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Facility highlights</h3>
                  <p className="text-sm text-gray-500">Cards shown on the Home page.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    change({
                      ...config,
                      home: {
                        ...home,
                        facilities: [
                          ...(home.facilities || []),
                          { title: "", description: "" },
                        ],
                        facilitiesImageUrls: [...(home.facilitiesImageUrls || []), ""],
                      },
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add highlight
                </Button>
              </div>
              <Accordion type="multiple" className="space-y-3">
                {(home.facilities || []).map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`home-facility-${index}`}
                    className="rounded-lg border px-4"
                  >
                    <AccordionTrigger>
                      {item.title?.trim() || `Untitled highlight ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-5 pt-2 lg:grid-cols-2">
                        <div className="space-y-5">
                          <TextField
                            label="Title"
                            value={item.title}
                            onChange={(title) => {
                              const items = [...(home.facilities || [])]
                              items[index] = { ...item, title }
                              change({ ...config, home: { ...home, facilities: items } })
                            }}
                          />
                          <TextField
                            label="Description"
                            value={item.description}
                            multiline
                            onChange={(description) => {
                              const items = [...(home.facilities || [])]
                              items[index] = { ...item, description }
                              change({ ...config, home: { ...home, facilities: items } })
                            }}
                          />
                        </div>
                        <ImageField
                          label="Image"
                          description="Optional card image."
                          value={home.facilitiesImageUrls?.[index]}
                          disabled={isSaving}
                          aspectRatio={4 / 3}
                          onChange={(url) => {
                            const images = [...(home.facilitiesImageUrls || [])]
                            while (images.length <= index) images.push("")
                            images[index] = url
                            change({
                              ...config,
                              home: { ...home, facilitiesImageUrls: images },
                            })
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-4 text-red-600"
                        onClick={() =>
                          change({
                            ...config,
                            home: {
                              ...home,
                              facilities: (home.facilities || []).filter(
                                (_, i) => i !== index
                              ),
                              facilitiesImageUrls: (
                                home.facilitiesImageUrls || []
                              ).filter((_, i) => i !== index),
                            },
                          })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove highlight
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {activeSection === "about" && (
          <div className="space-y-8">
            <PageTextPanel>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Banner title"
                  value={about.pageTitle}
                  onChange={(pageTitle) =>
                    change({ ...config, about: { ...about, pageTitle } })
                  }
                />
                <TextField
                  label="Page heading"
                  value={about.heading}
                  onChange={(heading) =>
                    change({ ...config, about: { ...about, heading } })
                  }
                />
                <TextField
                  label="Introduction"
                  value={about.body}
                  multiline
                  onChange={(body) => change({ ...config, about: { ...about, body } })}
                />
                <TextField
                  label="Additional information"
                  value={about.secondaryBody}
                  multiline
                  onChange={(secondaryBody) =>
                    change({ ...config, about: { ...about, secondaryBody } })
                  }
                />
                <TextField
                  label="Highlight heading"
                  value={about.highlightTitle}
                  onChange={(highlightTitle) =>
                    change({ ...config, about: { ...about, highlightTitle } })
                  }
                />
                <TextField
                  label="Highlight text"
                  value={about.highlightBody}
                  multiline
                  onChange={(highlightBody) =>
                    change({ ...config, about: { ...about, highlightBody } })
                  }
                />
                <TextField
                  label="Contact button label"
                  value={about.ctaLabel}
                  onChange={(ctaLabel) =>
                    change({ ...config, about: { ...about, ctaLabel } })
                  }
                />
              </div>
            </PageTextPanel>
            <ImageField
              label="About banner"
              description="Wide image at the top of About."
              value={about.bannerImageUrl}
              disabled={isSaving}
              onChange={(bannerImageUrl) =>
                change({ ...config, about: { ...about, bannerImageUrl } })
              }
            />
          </div>
        )}

        {activeSection === "academics" && (
          <div className="space-y-8">
            <PageTextPanel>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Banner title"
                  value={academics.pageTitle}
                  onChange={(pageTitle) =>
                    change({ ...config, academics: { ...academics, pageTitle } })
                  }
                />
                <TextField
                  label="Page heading"
                  value={academics.heading}
                  onChange={(heading) =>
                    change({ ...config, academics: { ...academics, heading } })
                  }
                />
                <div className="md:col-span-2">
                  <TextField
                    label="Introduction"
                    value={academics.introduction}
                    multiline
                    onChange={(introduction) =>
                      change({
                        ...config,
                        academics: { ...academics, introduction },
                      })
                    }
                  />
                </div>
              </div>
            </PageTextPanel>
            <ImageField
              label="Academics banner"
              description="Wide image at the top of Academics."
              value={academics.bannerImageUrl}
              disabled={isSaving}
              onChange={(bannerImageUrl) =>
                change({ ...config, academics: { ...academics, bannerImageUrl } })
              }
            />
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Academic programs</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    change({
                      ...config,
                      academics: {
                        ...academics,
                        programs: [
                          ...(academics.programs || []),
                          { title: "", description: "", imageUrl: "" },
                        ],
                      },
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add program
                </Button>
              </div>
              <Accordion type="multiple" className="space-y-3">
                {(academics.programs || []).map((program, index) => (
                  <AccordionItem
                    key={index}
                    value={`program-${index}`}
                    className="rounded-lg border px-4"
                  >
                    <AccordionTrigger>
                      {program.title?.trim() || `Untitled program ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-5 pt-2 lg:grid-cols-2">
                        <div className="space-y-5">
                          <TextField
                            label="Program name"
                            value={program.title}
                            onChange={(title) => {
                              const programs = [...(academics.programs || [])]
                              programs[index] = { ...program, title }
                              change({ ...config, academics: { ...academics, programs } })
                            }}
                          />
                          <TextField
                            label="Description"
                            value={program.description}
                            multiline
                            onChange={(description) => {
                              const programs = [...(academics.programs || [])]
                              programs[index] = { ...program, description }
                              change({ ...config, academics: { ...academics, programs } })
                            }}
                          />
                        </div>
                        <ImageField
                          label="Program image"
                          description="Shown above the program."
                          value={program.imageUrl || program.image_url}
                          disabled={isSaving}
                          aspectRatio={4 / 3}
                          onChange={(imageUrl) => {
                            const programs = [...(academics.programs || [])]
                            programs[index] = {
                              ...program,
                              imageUrl,
                              image_url: undefined,
                            }
                            change({ ...config, academics: { ...academics, programs } })
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-4 text-red-600"
                        aria-label={`Remove academic program ${index + 1}`}
                        onClick={() =>
                          change({
                            ...config,
                            academics: {
                              ...academics,
                              programs: (academics.programs || []).filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            },
                          })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove program
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {activeSection === "facilities" && (
          <div className="space-y-8">
            <PageTextPanel>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Banner title"
                  value={facilities.pageTitle}
                  onChange={(pageTitle) =>
                    change({ ...config, facilities: { ...facilities, pageTitle } })
                  }
                />
                <TextField
                  label="Page heading"
                  value={facilities.heading}
                  onChange={(heading) =>
                    change({ ...config, facilities: { ...facilities, heading } })
                  }
                />
                <div className="md:col-span-2">
                  <TextField
                    label="Introduction"
                    value={facilities.introduction}
                    multiline
                    onChange={(introduction) =>
                      change({
                        ...config,
                        facilities: { ...facilities, introduction },
                      })
                    }
                  />
                </div>
              </div>
            </PageTextPanel>
            <ImageField
              label="Facilities banner"
              description="Wide image at the top of Facilities."
              value={facilities.bannerImageUrl}
              disabled={isSaving}
              onChange={(bannerImageUrl) =>
                change({ ...config, facilities: { ...facilities, bannerImageUrl } })
              }
            />
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Facility gallery</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    change({
                      ...config,
                      facilities: {
                        ...facilities,
                        imageUrls: [...(facilities.imageUrls || []), ""],
                      },
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add image
                </Button>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {(facilities.imageUrls || []).map((url, index) => (
                  <div key={index} className="relative rounded-lg border p-4">
                    <ImageField
                      label={`Facility ${index + 1}`}
                      description="Facility gallery image."
                      value={url}
                      disabled={isSaving}
                      aspectRatio={4 / 3}
                      onChange={(nextUrl) => {
                        const imageUrls = [...(facilities.imageUrls || [])]
                        imageUrls[index] = nextUrl
                        change({ ...config, facilities: { ...facilities, imageUrls } })
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        change({
                          ...config,
                          facilities: {
                            ...facilities,
                            imageUrls: (facilities.imageUrls || []).filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          },
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "gallery" && (
          <div className="space-y-6">
            <PageTextPanel>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Banner title"
                  value={gallery.pageTitle}
                  onChange={(pageTitle) =>
                    change({ ...config, gallery: { ...gallery, pageTitle } })
                  }
                />
                <TextField
                  label="Page heading"
                  value={gallery.heading}
                  onChange={(heading) =>
                    change({ ...config, gallery: { ...gallery, heading } })
                  }
                />
                <div className="md:col-span-2">
                  <TextField
                    label="Introduction"
                    value={gallery.subtitle}
                    multiline
                    onChange={(subtitle) =>
                      change({ ...config, gallery: { ...gallery, subtitle } })
                    }
                  />
                </div>
              </div>
            </PageTextPanel>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Gallery items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  change({
                    ...config,
                    gallery: {
                      ...gallery,
                      items: [
                        ...(gallery.items || []),
                        { title: "", description: "", imageUrl: "" },
                      ],
                    },
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add item
              </Button>
            </div>
            <Accordion type="multiple" className="space-y-3">
              {(gallery.items || []).map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`gallery-${index}`}
                  className="rounded-lg border px-4"
                >
                  <AccordionTrigger>
                    {item.title?.trim() || `Untitled gallery item ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-5 pt-2 lg:grid-cols-2">
                      <div className="space-y-5">
                        <TextField
                          label="Title"
                          value={item.title}
                          onChange={(title) => {
                            const items = [...(gallery.items || [])]
                            items[index] = { ...item, title }
                            change({ ...config, gallery: { ...gallery, items } })
                          }}
                        />
                        <TextField
                          label="Description"
                          value={item.description}
                          multiline
                          onChange={(description) => {
                            const items = [...(gallery.items || [])]
                            items[index] = { ...item, description }
                            change({ ...config, gallery: { ...gallery, items } })
                          }}
                        />
                      </div>
                      <ImageField
                        label="Gallery image"
                        description="Image for this gallery item."
                        value={item.imageUrl}
                        disabled={isSaving}
                        aspectRatio={4 / 3}
                        onChange={(imageUrl) => {
                          const items = [...(gallery.items || [])]
                          items[index] = { ...item, imageUrl }
                          change({ ...config, gallery: { ...gallery, items } })
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-red-600"
                      aria-label={`Remove gallery item ${index + 1}`}
                      onClick={() =>
                        change({
                          ...config,
                          gallery: {
                            ...gallery,
                            items: (gallery.items || []).filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          },
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove item
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {activeSection === "news" && (
          <div className="space-y-8">
            <PageTextPanel>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Banner title"
                  value={news.pageTitle}
                  onChange={(pageTitle) =>
                    change({ ...config, news: { ...news, pageTitle } })
                  }
                />
                <TextField
                  label="Page heading"
                  value={news.heading}
                  onChange={(heading) =>
                    change({ ...config, news: { ...news, heading } })
                  }
                />
              </div>
            </PageTextPanel>
            <ImageField
              label="News banner"
              description="Wide image at the top of News."
              value={news.bannerImageUrl}
              disabled={isSaving}
              onChange={(bannerImageUrl) =>
                change({ ...config, news: { ...news, bannerImageUrl } })
              }
            />
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">News posts</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  change({
                    ...config,
                    news: {
                      ...news,
                      items: [
                        ...(news.items || []),
                        { id: `news-${Date.now()}`, title: "", date: "", content: "" },
                      ],
                    },
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add post
              </Button>
            </div>
            <Accordion type="multiple" className="space-y-3">
              {(news.items || []).map((item, index) => (
                <AccordionItem
                  key={item.id || index}
                  value={item.id || `news-${index}`}
                  className="rounded-lg border px-4"
                >
                  <AccordionTrigger>
                    {item.title?.trim() || `Untitled post ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-2 md:grid-cols-2">
                      <TextField
                        label="Title"
                        value={item.title}
                        onChange={(title) => {
                          const items = [...(news.items || [])]
                          items[index] = { ...item, title }
                          change({ ...config, news: { ...news, items } })
                        }}
                      />
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={item.date || ""}
                          onChange={(event) => {
                            const items = [...(news.items || [])]
                            items[index] = { ...item, date: event.target.value }
                            change({ ...config, news: { ...news, items } })
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <TextField
                          label="Content"
                          value={item.content}
                          multiline
                          onChange={(content) => {
                            const items = [...(news.items || [])]
                            items[index] = { ...item, content }
                            change({ ...config, news: { ...news, items } })
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-fit"
                        onClick={() =>
                          change({
                            ...config,
                            news: {
                              ...news,
                              items: (news.items || []).filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            },
                          })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove post
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {activeSection === "contact" && (
          <div className="space-y-8">
            <PageTextPanel>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Banner title"
                  value={contact.pageTitle}
                  onChange={(pageTitle) =>
                    change({ ...config, contact: { ...contact, pageTitle } })
                  }
                />
                <TextField
                  label="Page heading"
                  value={contact.heading}
                  onChange={(heading) =>
                    change({ ...config, contact: { ...contact, heading } })
                  }
                />
                <div className="md:col-span-2">
                  <TextField
                    label="Introduction"
                    value={contact.introduction}
                    multiline
                    onChange={(introduction) =>
                      change({ ...config, contact: { ...contact, introduction } })
                    }
                  />
                </div>
              </div>
            </PageTextPanel>
            <div className="grid gap-6 lg:grid-cols-2">
              <ImageField
                label="Contact banner"
                description="Wide image at the top of Contact."
                value={contact.bannerImageUrl}
                disabled={isSaving}
                onChange={(bannerImageUrl) =>
                  change({ ...config, contact: { ...contact, bannerImageUrl } })
                }
              />
              <ImageField
                label="Admissions image"
                description="Image beside the school contact details."
                value={contact.joinUsImageUrl}
                disabled={isSaving}
                onChange={(joinUsImageUrl) =>
                  change({ ...config, contact: { ...contact, joinUsImageUrl } })
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
