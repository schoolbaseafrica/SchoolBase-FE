// Google Analytics utility functions

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-E345N8RGL7"

// Type definitions for gtag
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
  }
}

// Track page views
export const pageview = (url: string, schoolId?: string, schoolName?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
      school_id: schoolId,
      school_name: schoolName,
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
  schoolId,
  schoolName,
  userRole,
  ...otherParams
}: {
  action: string
  category?: string
  label?: string
  value?: number
  schoolId?: string
  schoolName?: string
  userRole?: string
  [key: string]: unknown
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      school_id: schoolId,
      school_name: schoolName,
      user_role: userRole,
      ...otherParams,
    })
  }
}
