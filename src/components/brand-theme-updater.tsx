"use client"

import { useEffect } from "react"
import { useSchoolStore } from "@/store/use-school-store"

export function BrandThemeUpdater() {
  const brand = useSchoolStore((state) => state.school.brand)
  const schoolName = useSchoolStore((state) => state.school.name)
  const isConfigLoading = useSchoolStore((state) => state.isConfigLoading)

  // Use individual brand properties as dependencies to ensure updates trigger
  const primaryColor = brand.primary
  const primaryHover = brand.primaryHover
  const secondaryColor = brand.secondary
  const accentColor = brand.accent

  useEffect(() => {
    // Don't apply theme until config has finished loading
    // This prevents the flash of default theme before API/config loads
    if (isConfigLoading) {
      return
    }

    const root = document.documentElement
    const palette: Record<string, string> = {
      "--accent": accentColor || brand.primary,
      "--accent-foreground": brand.onPrimary,
      "--primary": brand.primary,
      "--primary-hover": brand.primaryHover,
      "--secondary": secondaryColor || brand.primary,
      "--secondary-hover": brand.secondaryHover || brand.primaryHover,
      "--secondary-foreground": brand.onPrimary,
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
  }, [brand, schoolName, primaryColor, primaryHover, secondaryColor, accentColor, isConfigLoading])

  return null
}
