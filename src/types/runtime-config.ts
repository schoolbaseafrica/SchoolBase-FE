import type { SchoolProfile, BrandPalette } from "@/data/school-profile"

/**
 * Runtime configuration that can be loaded from environment variables or API
 * This represents the minimal config needed to customize a school instance
 */
export interface RuntimeSchoolConfig {
  name?: string
  shortName?: string
  logoUrl?: string
  logoMark?: string
  faviconUrl?: string
  primaryColor?: string
  primaryHover?: string
  secondaryColor?: string
  accentColor?: string
  supportEmail?: string
  supportPhone?: string
  description?: string
  tagline?: string
}

/**
 * Complete runtime configuration structure
 */
export interface RuntimeConfig {
  school: RuntimeSchoolConfig
  apiUrl?: string
  environment: "development" | "staging" | "production"
}

/**
 * Helper type for partial brand palette updates
 */
export type PartialBrandPalette = Partial<BrandPalette>

/**
 * Helper type for partial school profile updates
 */
export type PartialSchoolProfile = Partial<SchoolProfile>
