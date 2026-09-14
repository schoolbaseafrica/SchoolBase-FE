"use client"

import { create } from "zustand"
import { defaultSchoolProfile, type SchoolProfile } from "@/data/school-profile"
import {
  loadConfigFromAPI,
  buildSchoolProfileFromRuntimeConfig,
} from "@/lib/config-loader"
import type { RuntimeConfig } from "@/types/runtime-config"

type SchoolState = {
  school: SchoolProfile
  isConfigLoading: boolean
  configError: string | null
  setSchool: (school: SchoolProfile) => void
  updateSchool: (updates: Partial<SchoolProfile>) => void
  loadConfig: (force?: boolean) => Promise<void>
}

// Always start with loading state to prevent hydration mismatches
// Config will be loaded in useEffect on client-side
// Server and client both start with the same initial state
const initialState = {
  school: defaultSchoolProfile,
  isConfigLoading: true,
}

const CONFIG_CACHE_PREFIX = "schoolbase:runtime-config:v1"

function cacheKey(): string {
  return `${CONFIG_CACHE_PREFIX}:${window.location.hostname.toLowerCase()}`
}

function saveConfigForCurrentHost(config: RuntimeConfig): void {
  try {
    window.localStorage.setItem(
      cacheKey(),
      JSON.stringify({ config, savedAt: new Date().toISOString() })
    )
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

function loadConfigForCurrentHost(): RuntimeConfig | null {
  try {
    const raw = window.localStorage.getItem(cacheKey())
    if (!raw) return null
    const parsed = JSON.parse(raw) as { config?: RuntimeConfig }
    return parsed.config ?? null
  } catch {
    return null
  }
}

export const useSchoolStore = create<SchoolState>((set, get) => ({
  school: initialState.school,
  isConfigLoading: initialState.isConfigLoading,
  configError: null,

  setSchool: (school) => set({ school }),

  updateSchool: (updates) =>
    set((state) => ({
      school: { ...state.school, ...updates },
    })),

  /**
   * Loads configuration from environment variables or API
   * Only uses API/env data if it has required fields (name + primaryColor)
   * Falls back to defaults only if API/env is unavailable or incomplete
   * Only runs on client-side (browser)
   */
  loadConfig: async (force = false) => {
    // Only run on client-side
    if (typeof window === "undefined") {
      return
    }

    // Don't reload if already loaded and not forcing
    if (!force && !get().isConfigLoading) {
      return
    }

    set({ isConfigLoading: true, configError: null })

    try {
      // The runtime endpoints belong to this container and hostname. Browser
      // build-time values are intentionally ignored because the same image is
      // shared by multiple schools.
      const apiConfig = await loadConfigFromAPI()

      if (apiConfig?.school) {
        const schoolProfile = buildSchoolProfileFromRuntimeConfig(apiConfig.school)
        if (schoolProfile) {
          saveConfigForCurrentHost(apiConfig)
          set({ school: schoolProfile, isConfigLoading: false })
          return
        }
      }

      // A cached config is scoped to the exact hostname, preventing one
      // school's branding from appearing on another school's domain.
      const cachedConfig = loadConfigForCurrentHost()
      const cachedProfile = buildSchoolProfileFromRuntimeConfig(
        cachedConfig?.school ?? null
      )
      if (cachedProfile) {
        set({ school: cachedProfile, isConfigLoading: false })
        return
      }

      set({
        configError: "School configuration is temporarily unavailable",
        isConfigLoading: false,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load configuration"
      console.error("Error loading school config:", error)
      set({
        configError: errorMessage,
        isConfigLoading: false,
      })
    }
  },
}))
