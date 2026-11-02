import { readFile, writeFile, rename } from "node:fs/promises"
import { join } from "node:path"
import type { RuntimeSchoolConfig } from "@/types/runtime-config"

type CachedBranding = { slug: string; school: RuntimeSchoolConfig }

function cachePath(): string | null {
  const directory = process.env.SCHOOL_BRANDING_CACHE_DIR
  return directory ? join(directory, "school.json") : null
}

function validSchool(value: unknown): value is RuntimeSchoolConfig {
  if (!value || typeof value !== "object") return false
  const school = value as Record<string, unknown>
  return (
    typeof school.name === "string" &&
    school.name.trim().length > 0 &&
    typeof school.primaryColor === "string" &&
    /^#[0-9a-f]{6}$/i.test(school.primaryColor) &&
    (school.logoUrl === undefined || typeof school.logoUrl === "string")
  )
}

function logoUrlFromSchool(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined
  if (/^https?:\/\//i.test(value)) return value
  const apiUrl = process.env.API_PUBLIC_URL
  if (!apiUrl) return undefined
  try {
    return new URL(
      value.startsWith("/") ? value : `/${value}`,
      new URL(apiUrl).origin
    ).toString()
  } catch {
    return undefined
  }
}

export async function readSchoolBranding(): Promise<RuntimeSchoolConfig | null> {
  const path = cachePath()
  const slug = process.env.APP_SLUG
  if (!path || !slug) return null
  try {
    const cached = JSON.parse(await readFile(path, "utf8")) as CachedBranding
    return cached.slug === slug && validSchool(cached.school) ? cached.school : null
  } catch {
    return null
  }
}

export async function saveSchoolBranding(payload: unknown): Promise<void> {
  const path = cachePath()
  const slug = process.env.APP_SLUG
  if (!path || !slug || !payload || typeof payload !== "object") return
  const data = (payload as { data?: unknown }).data ?? payload
  if (!data || typeof data !== "object") return
  const school = data as Record<string, unknown>
  const profile: RuntimeSchoolConfig = {
    name: typeof school.name === "string" ? school.name : "",
    primaryColor: typeof school.primary_color === "string" ? school.primary_color : "",
    secondaryColor:
      typeof school.secondary_color === "string" ? school.secondary_color : undefined,
    accentColor:
      typeof school.accent_color === "string" ? school.accent_color : undefined,
    logoUrl: logoUrlFromSchool(school.logo_url),
    supportEmail: typeof school.email === "string" ? school.email : undefined,
    supportPhone: typeof school.phone === "string" ? school.phone : undefined,
  }
  if (!validSchool(profile)) return

  const temporaryPath = `${path}.${process.pid}.${crypto.randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, JSON.stringify({ slug, school: profile }), {
      mode: 0o600,
    })
    await rename(temporaryPath, path)
  } catch (error) {
    console.warn("Could not persist school branding:", error)
  }
}
