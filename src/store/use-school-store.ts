"use client"

import { create } from "zustand"
import { defaultSchoolProfile, type SchoolProfile } from "@/data/school-profile"
import {
  loadConfigFromEnv,
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
      // Strategy 1: Check environment variables first (synchronous, fast)
      const envConfig = loadConfigFromEnv()
      if (envConfig?.school) {
        const schoolProfile = buildSchoolProfileFromRuntimeConfig(envConfig.school)
        if (schoolProfile) {
          set({ school: schoolProfile, isConfigLoading: false })
          return
        }
      }

      // Strategy 2: Try backend API (single source of truth from database)
      // Backend stores school config in database, this is the authoritative source
      const apiConfig = await loadConfigFromAPI()

      if (apiConfig?.school) {
        const schoolProfile = buildSchoolProfileFromRuntimeConfig(apiConfig.school)
        if (schoolProfile) {
          set({ school: schoolProfile, isConfigLoading: false })
          return
        }
      }

      // No valid config found (missing required fields or unavailable), use defaults
      set({ school: defaultSchoolProfile, isConfigLoading: false })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load configuration"
      console.error("Error loading school config:", error)
      set({
        configError: errorMessage,
        school: defaultSchoolProfile,
        isConfigLoading: false,
      })
      // On error, use defaults (backward compatible)
    }
  },
}))
