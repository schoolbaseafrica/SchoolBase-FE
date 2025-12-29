"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BellIcon, X, Loader2, CheckCircle2, Circle, ExternalLink } from "lucide-react"
import {
  useNotifications,
  useMarkNotificationAsRead,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export const NotificationsDrawer = () => {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const router = useRouter()

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useNotifications(filter === "unread" ? false : undefined)

  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const { mutate: markAsRead } = useMarkNotificationAsRead()

  const notifications = data?.pages.flatMap((page) => page.data.notifications) ?? []

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-4 w-4"
    switch (type) {
      case "SYSTEM_ALERT":
        return <BellIcon className={cn(iconClass, "text-blue-600")} />
      case "ASSIGNMENT":
        return <BellIcon className={cn(iconClass, "text-purple-600")} />
      case "GRADE_POSTED":
        return <BellIcon className={cn(iconClass, "text-green-600")} />
      case "ANNOUNCEMENT":
        return <BellIcon className={cn(iconClass, "text-orange-600")} />
      default:
        return <BellIcon className={cn(iconClass, "text-gray-600")} />
    }
  }

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      router.push(notification.action_url)
      setOpen(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="text-text-secondary size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-[400px] sm:max-w-[400px]">
        <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DrawerTitle>Notifications</DrawerTitle>
            {unreadCount > 0 && (
              <p className="mt-1 text-xs text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Filter Tabs */}
        <div className="border-b px-4 py-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <BellIcon className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm font-medium text-gray-600">
                Unable to load notifications
              </p>
              <p className="mt-1 text-center text-xs text-gray-500">
                {error instanceof Error && error.message?.includes("400")
                  ? "Please contact your administrator"
                  : "Please try again later"}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BellIcon className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm font-medium text-gray-600">No notifications</p>
              <p className="mt-1 text-xs text-gray-500">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You'll see notifications here"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "group cursor-pointer p-4 transition-colors hover:bg-gray-50",
                      !notification.is_read && "bg-blue-50/50"
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="shrink-0 pt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm font-semibold text-gray-900",
                              !notification.is_read && "font-bold"
                            )}
                          >
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <Circle className="h-2 w-2 shrink-0 fill-blue-600 text-blue-600" />
                          )}
                        </div>

                        <p className="line-clamp-2 text-xs text-gray-600">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{timeAgo}</span>
                          {notification.action_url && (
                            <span className="flex items-center gap-1 text-blue-600 group-hover:underline">
                              View
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Read status */}
                      {notification.is_read && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Load More */}
              {hasNextPage && (
                <div className="p-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
//   DrawerTrigger,
// } from "@/components/ui/drawer"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { BellIcon, X, Loader2, CheckCircle2, Circle, ExternalLink } from "lucide-react"
// import {
//   useNotifications,
//   useMarkNotificationAsRead,
//   useUnreadNotificationCount,
// } from "@/hooks/use-notifications"
// import { useRouter } from "next/navigation"
// import { formatDistanceToNow } from "date-fns"
// import { cn } from "@/lib/utils"

// export const NotificationsDrawer = () => {
//   const [open, setOpen] = useState(false)
//   const [filter, setFilter] = useState<"all" | "unread">("all")
//   const router = useRouter()

//   const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
//     useNotifications(filter === "unread" ? false : undefined)

//   const { data: unreadCount = 0 } = useUnreadNotificationCount()
//   const { mutate: markAsRead } = useMarkNotificationAsRead()

//   const notifications = data?.pages.flatMap((page) => page.data.notifications) ?? []

//   const getNotificationIcon = (type: string) => {
//     const iconClass = "h-4 w-4"
//     switch (type) {
//       case "SYSTEM_ALERT":
//         return <BellIcon className={cn(iconClass, "text-blue-600")} />
//       case "ASSIGNMENT":
//         return <BellIcon className={cn(iconClass, "text-purple-600")} />
//       case "GRADE_POSTED":
//         return <BellIcon className={cn(iconClass, "text-green-600")} />
//       case "ANNOUNCEMENT":
//         return <BellIcon className={cn(iconClass, "text-orange-600")} />
//       default:
//         return <BellIcon className={cn(iconClass, "text-gray-600")} />
//     }
//   }

//   const handleNotificationClick = (notification: (typeof notifications)[0]) => {
//     // Mark as read if unread
//     if (!notification.is_read) {
//       markAsRead(notification.id)
//     }

//     // Navigate to action URL if available
//     if (notification.action_url) {
//       router.push(notification.action_url)
//       setOpen(false)
//     }
//   }

//   return (
//     <Drawer open={open} onOpenChange={setOpen} direction="right">
//       <DrawerTrigger asChild>
//         <Button variant="ghost" size="icon" className="relative">
//           <BellIcon className="text-text-secondary size-5" />
//           {unreadCount > 0 && (
//             <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
//               {unreadCount > 99 ? "99+" : unreadCount}
//             </span>
//           )}
//         </Button>
//       </DrawerTrigger>

//       <DrawerContent className="w-[400px] sm:max-w-[400px]">
//         <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
//           <div>
//             <DrawerTitle>Notifications</DrawerTitle>
//             {unreadCount > 0 && (
//               <p className="mt-1 text-xs text-gray-500">{unreadCount} unread</p>
//             )}
//           </div>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="size-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         {/* Filter Tabs */}
//         <div className="border-b px-4 py-3">
//           <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="all">All</TabsTrigger>
//               <TabsTrigger value="unread">
//                 Unread
//                 {unreadCount > 0 && (
//                   <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
//                     {unreadCount}
//                   </span>
//                 )}
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         <ScrollArea className="flex-1">
//           {isLoading ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//             </div>
//           ) : notifications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12">
//               <BellIcon className="h-12 w-12 text-gray-300" />
//               <p className="mt-4 text-sm font-medium text-gray-600">No notifications</p>
//               <p className="mt-1 text-xs text-gray-500">
//                 {filter === "unread"
//                   ? "You're all caught up!"
//                   : "You'll see notifications here"}
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {notifications.map((notification) => {
//                 const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
//                   addSuffix: true,
//                 })

//                 return (
//                   <div
//                     key={notification.id}
//                     onClick={() => handleNotificationClick(notification)}
//                     className={cn(
//                       "group cursor-pointer p-4 transition-colors hover:bg-gray-50",
//                       !notification.is_read && "bg-blue-50/50"
//                     )}
//                   >
//                     <div className="flex gap-3">
//                       {/* Icon */}
//                       <div className="flex-shrink-0 pt-1">
//                         {getNotificationIcon(notification.type)}
//                       </div>

//                       {/* Content */}
//                       <div className="flex-1 space-y-1">
//                         <div className="flex items-start justify-between gap-2">
//                           <h4
//                             className={cn(
//                               "text-sm font-semibold text-gray-900",
//                               !notification.is_read && "font-bold"
//                             )}
//                           >
//                             {notification.title}
//                           </h4>
//                           {!notification.is_read && (
//                             <Circle className="h-2 w-2 flex-shrink-0 fill-blue-600 text-blue-600" />
//                           )}
//                         </div>

//                         <p className="line-clamp-2 text-xs text-gray-600">
//                           {notification.message}
//                         </p>

//                         <div className="flex items-center gap-2 text-xs text-gray-500">
//                           <span>{timeAgo}</span>
//                           {notification.action_url && (
//                             <span className="flex items-center gap-1 text-blue-600 group-hover:underline">
//                               View
//                               <ExternalLink className="h-3 w-3" />
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Read status */}
//                       {notification.is_read && (
//                         <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
//                       )}
//                     </div>
//                   </div>
//                 )
//               })}

//               {/* Load More */}
//               {hasNextPage && (
//                 <div className="p-4">
//                   <Button
//                     variant="outline"
//                     className="w-full"
//                     onClick={() => fetchNextPage()}
//                     disabled={isFetchingNextPage}
//                   >
//                     {isFetchingNextPage ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Loading...
//                       </>
//                     ) : (
//                       "Load more"
//                     )}
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </ScrollArea>
//       </DrawerContent>
//     </Drawer>
//   )
// }
