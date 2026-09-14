"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { useSchoolStore } from "@/store/use-school-store"

interface ConfigProviderProps {
  children: ReactNode
}

/**
 * ConfigProvider loads school configuration on app startup
 * Only loads from API if env vars weren't available at initialization
 */
export function ConfigProvider({ children }: ConfigProviderProps) {
  const isConfigLoading = useSchoolStore((state) => state.isConfigLoading)
  const configError = useSchoolStore((state) => state.configError)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // Only load config once on mount, and only if still loading
    // (If env vars were available at initialization, isConfigLoading will be false)
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      // Check current loading state and only call loadConfig if still loading
      // This will fetch from API as fallback if env vars weren't available
      const currentState = useSchoolStore.getState()
      if (currentState.isConfigLoading) {
        currentState.loadConfig()
      }
    }
  }, []) // Empty deps array - we only want to run once on mount

  useEffect(() => {
    if (configError) {
      console.warn("Config loading error:", configError)
    }
  }, [configError])

  // Show loading state only if config is still loading (fetching from API)
  // If env vars were available, this won't show (isConfigLoading will be false)
  // IMPORTANT: All hooks must be called before any conditional returns
  if (isConfigLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Loading school configuration...</p>
        </div>
      </div>
    )
  }

  if (configError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            SchoolBase is temporarily unavailable
          </h1>
          <p className="mt-3 text-gray-600">
            We could not load this school&apos;s information. Your school and its data are
            safe. Please check your connection and try again.
          </p>
          <button
            type="button"
            className="mt-6 rounded-md bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-800"
            onClick={() => useSchoolStore.getState().loadConfig(true)}
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
