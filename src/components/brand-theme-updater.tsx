"use client"

import { useEffect } from "react"
import { useSchoolStore } from "@/store/use-school-store"

export function BrandThemeUpdater() {
  const brand = useSchoolStore((state) => state.school.brand)

  useEffect(() => {
    const root = document.documentElement
    const palette: Record<string, string> = {
      "--accent": brand.primary,
      "--primary": brand.primary,
      "--primary-hover": brand.primaryHover,
      "--accent-foreground": brand.onPrimary,
      "--text-primary": brand.text,
      "--text-secondary": brand.mutedText,
      "--tint": brand.tint,
      "--sidebar": brand.surface,
      "--sidebar-foreground": brand.text,
      "--sidebar-primary": brand.primary,
      "--sidebar-primary-foreground": brand.onPrimary,
      "--sidebar-accent": brand.tint,
      "--sidebar-accent-foreground": brand.primary,
    }

    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [brand])

  return null
}
