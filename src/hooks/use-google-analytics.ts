"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { pageview, event } from "@/lib/gtag"
import { useSchoolStore } from "@/store/use-school-store"
import { useUserStore } from "@/store/use-user-store"

/**
 * Hook to automatically track page views and provide event tracking
 */
export function useGoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const school = useSchoolStore((state) => state.school)
  const user = useUserStore((state) => state.user)

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
      pageview(url, school.id, school.name)
    }
  }, [pathname, searchParams, school.id, school.name])

  // Track custom events
  const trackEvent = (
    action: string,
    options?: {
      category?: string
      label?: string
      value?: number
      [key: string]: unknown
    }
  ) => {
    event({
      action,
      category: options?.category,
      label: options?.label,
      value: options?.value,
      schoolId: school.id,
      schoolName: school.name,
      userRole: user?.role?.join(","),
      ...options,
    })
  }

  return { trackEvent }
}

/**
 * Standalone hook for tracking events without page view tracking
 */
export function useTrackEvent() {
  const school = useSchoolStore((state) => state.school)
  const user = useUserStore((state) => state.user)

  const trackEvent = (
    action: string,
    options?: {
      category?: string
      label?: string
      value?: number
      [key: string]: unknown
    }
  ) => {
    event({
      action,
      category: options?.category,
      label: options?.label,
      value: options?.value,
      schoolId: school.id,
      schoolName: school.name,
      userRole: user?.role?.join(","),
      ...options,
    })
  }

  return { trackEvent }
}
