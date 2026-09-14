"use client"

import { useEffect, useState } from "react"
import { ExternalLink, LayoutTemplate, Loader2, PanelsTopLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { WebsiteLayout } from "@/data/school-profile"
import { cn } from "@/lib/utils"
import { useSchoolStore } from "@/store/use-school-store"

const options: {
  value: WebsiteLayout
  title: string
  description: string
  detail: string
  icon: typeof LayoutTemplate
}[] = [
  {
    value: "one_page",
    title: "One-page website",
    description: "Visitors scroll through your school information on one page.",
    detail: "A focused choice for schools that want a simple, quick website.",
    icon: LayoutTemplate,
  },
  {
    value: "multi_page",
    title: "Multi-page website",
    description:
      "Visitors use separate pages for your school, academics, facilities, news, and contact details.",
    detail: "A better fit for schools with more content and regular updates.",
    icon: PanelsTopLeft,
  },
]

export function WebsiteLayoutSettings() {
  const currentLayout = useSchoolStore((state) => state.school.websiteLayout)
  const updateSchool = useSchoolStore((state) => state.updateSchool)
  const [selected, setSelected] = useState<WebsiteLayout>(currentLayout)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => setSelected(currentLayout), [currentLayout])

  const save = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/proxy-auth/school/website-layout", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website_layout: selected }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.message || "Could not update the website layout")
      }
      updateSchool({ websiteLayout: selected })
      toast.success("Website layout updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update the website layout"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website layout</CardTitle>
        <CardDescription>
          Choose how visitors move through your public school website. Changing the layout
          keeps your saved content and does not affect the school portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon
            const isSelected = selected === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(option.value)}
                className={cn(
                  "focus-visible:ring-accent rounded-xl border p-5 text-left transition focus-visible:ring-2 focus-visible:outline-none",
                  isSelected
                    ? "border-accent bg-accent/5 ring-accent ring-1"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "rounded-lg p-2",
                      isSelected ? "bg-accent text-white" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-900">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">
                      {option.description}
                    </span>
                    <span className="mt-2 block text-xs text-gray-500">
                      {option.detail}
                    </span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <a
            href={selected === "multi_page" ? "/site" : "/landing"}
            target="_blank"
            rel="noreferrer"
            className="text-accent inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            Preview selected layout <ExternalLink className="h-4 w-4" />
          </a>
          <Button
            type="button"
            onClick={save}
            disabled={isSaving || selected === currentLayout}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply layout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
