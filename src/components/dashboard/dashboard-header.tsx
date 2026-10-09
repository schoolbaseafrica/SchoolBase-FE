"use client"

import { useEffect, useState } from "react"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { NotificationsDrawer } from "@/components/notifications/notification-drawer"
import { PortalScrollMotion } from "@/components/dashboard/portal-scroll-motion"

const DashboardHeader = () => {
  const { state, isMobile, openMobile } = useSidebar()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  // Desktop: show trigger when collapsed
  const showDesktopTrigger = !isMobile && state === "collapsed"

  // Mobile: show trigger when mobile sidebar is closed
  const showMobileTrigger = isMobile && !openMobile

  const showTrigger = showDesktopTrigger || showMobileTrigger

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--portal-canvas)]/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <PortalScrollMotion />
      <div
        className={`flex h-14 items-center justify-between rounded-2xl border border-[var(--portal-line)] bg-white px-4 transition-shadow duration-300 ${
          scrolled
            ? "shadow-[0_14px_32px_rgba(21,38,29,0.12)]"
            : "shadow-[0_8px_24px_rgba(21,38,29,0.045)]"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {showTrigger && <SidebarTrigger className="shrink-0" />}
          <span className="portal-section-label truncate">SchoolBase workspace</span>
        </div>
        <aside className="flex shrink-0 items-center rounded-full border border-[var(--portal-line)] bg-white">
          <NotificationsDrawer />
        </aside>
      </div>
    </header>
  )
}

export default DashboardHeader
