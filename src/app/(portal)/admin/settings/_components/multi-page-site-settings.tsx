"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ImageUploaderWithCrop } from "@/components/image-upload/image-uploader-with-crop"
import { Button } from "@/components/ui/button"
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

const optionalPages = sections.filter(
  (section) => !["pages", "home"].includes(section.key)
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
        maxFileSizeMB={5}
        disabled={disabled}
        label={`Upload ${label.toLowerCase()}`}
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
              {optionalPages.map((page) => {
                const visible = !(config.hiddenPages || []).includes(page.key)
                return (
                  <div
                    key={page.key}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <Label htmlFor={`page-${page.key}`} className="font-medium">
                      {page.label}
                    </Label>
                    <Switch
                      id={`page-${page.key}`}
                      checked={visible}
                      onCheckedChange={(checked) => setPageVisible(page.key, checked)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeSection === "home" && (
          <div className="space-y-8">
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
              <div className="space-y-4">
                {(home.facilities || []).map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_1fr_1.2fr_auto]"
                  >
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
                          home: {
                            ...home,
                            facilitiesImageUrls: images,
                          },
                        })
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="self-start text-red-600"
                      aria-label={`Remove facility highlight ${index + 1}`}
                      onClick={() =>
                        change({
                          ...config,
                          home: {
                            ...home,
                            facilities: (home.facilities || []).filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                            facilitiesImageUrls: (home.facilitiesImageUrls || []).filter(
                              (_, imageIndex) => imageIndex !== index
                            ),
                          },
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "about" && (
          <ImageField
            label="About banner"
            description="Wide image at the top of About."
            value={about.bannerImageUrl}
            disabled={isSaving}
            onChange={(bannerImageUrl) =>
              change({ ...config, about: { ...about, bannerImageUrl } })
            }
          />
        )}

        {activeSection === "academics" && (
          <div className="space-y-8">
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
              <div className="space-y-4">
                {(academics.programs || []).map((program, index) => (
                  <div
                    key={index}
                    className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_1fr_1.2fr_auto]"
                  >
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
                    <ImageField
                      label="Program image"
                      description="Shown above the program."
                      value={program.imageUrl || program.image_url}
                      disabled={isSaving}
                      aspectRatio={4 / 3}
                      onChange={(imageUrl) => {
                        const programs = [...(academics.programs || [])]
                        programs[index] = { ...program, imageUrl, image_url: undefined }
                        change({ ...config, academics: { ...academics, programs } })
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="self-start text-red-600"
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
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "facilities" && (
          <div className="space-y-8">
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
            <TextField
              label="Gallery introduction"
              value={gallery.subtitle}
              multiline
              onChange={(subtitle) =>
                change({ ...config, gallery: { ...gallery, subtitle } })
              }
            />
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
            <div className="space-y-4">
              {(gallery.items || []).map((item, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_1fr_1.2fr_auto]"
                >
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-start text-red-600"
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
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "news" && (
          <div className="space-y-8">
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
            <div className="space-y-4">
              {(news.items || []).map((item, index) => (
                <div
                  key={item.id || index}
                  className="grid gap-4 rounded-lg border p-4 md:grid-cols-2"
                >
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
              ))}
            </div>
          </div>
        )}

        {activeSection === "contact" && (
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
        )}
      </CardContent>
    </Card>
  )
}
