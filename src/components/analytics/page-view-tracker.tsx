"use client"

import { useGoogleAnalytics } from "@/hooks/use-google-analytics"

/**
 * Component to track page views automatically
 * Add this to pages that need page view tracking
 */
export function PageViewTracker() {
  useGoogleAnalytics()
  return null
}
