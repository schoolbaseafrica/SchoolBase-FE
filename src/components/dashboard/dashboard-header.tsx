"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { NotificationsDrawer } from "@/components/notifications/notification-drawer"

const DashboardHeader = () => {
  const { state, isMobile, openMobile } = useSidebar()

  // Desktop: show trigger when collapsed
  const showDesktopTrigger = !isMobile && state === "collapsed"

  // Mobile: show trigger when mobile sidebar is closed
  const showMobileTrigger = isMobile && !openMobile

  const showTrigger = showDesktopTrigger || showMobileTrigger

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-[60px] w-full items-center justify-between border-b bg-white px-4">
      <div className="relative z-50">{showTrigger && <SidebarTrigger />}</div>

      <aside className="flex items-center gap-4 rounded-full border bg-gray-50">
        <NotificationsDrawer />
      </aside>
    </header>
  )
}

export default DashboardHeader
// "use client"

// import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
// import { BellIcon } from "lucide-react"
// import { Button } from "../ui/button"

// const DashboardHeader = () => {
//   const { state, isMobile, openMobile } = useSidebar()

//   // Desktop: show trigger when collapsed
//   const showDesktopTrigger = !isMobile && state === "collapsed"

//   // Mobile: show trigger when mobile sidebar is closed
//   const showMobileTrigger = isMobile && !openMobile

//   const showTrigger = showDesktopTrigger || showMobileTrigger

//   return (
//     // <header className="fixed top-0 right-0 left-0 z-50 flex h-[72px] w-full items-center justify-between border-b bg-white px-4">
//     <header className="fixed top-0 right-0 left-0 z-50 flex h-[50px] w-full items-center justify-between bg-white px-4">
//       <div className="relative z-50">{showTrigger && <SidebarTrigger />}</div>

//       <aside className="flex items-center gap-4">
//         <Button variant="ghost" size="icon" className="relative">
//           <BellIcon className="text-text-secondary size-5" />
//           <span className="bg-accent absolute top-0 right-0.5 h-1.5 w-1.5 rounded-full"></span>
//         </Button>
//       </aside>
//     </header>
//   )
// }

// export default DashboardHeader
