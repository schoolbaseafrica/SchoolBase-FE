// FILE: src/hooks/use-notifications.ts

"use client"

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  NotificationsAPI,
  GetNotificationsResponse,
  // Notification,
} from "@/lib/notifications"
import { toast } from "sonner"
import { AxiosError } from "axios"

// QUERY KEYS
export const NOTIFICATION_KEYS = {
  all: ["notifications"],
  infinite: (read?: boolean) => ["notifications", "infinite", { read }],
  single: (id: string) => ["notification", id],
  unreadCount: ["notifications", "unread-count"],
}

/**
 * Hook to get paginated notifications with infinite scroll
 * @param read - Optional filter for read/unread notifications
 */
export const useNotifications = (read?: boolean) => {
  return useInfiniteQuery<GetNotificationsResponse, Error>({
    queryKey: NOTIFICATION_KEYS.infinite(read),
    queryFn: async ({ pageParam = 1 }) => {
      return NotificationsAPI.getUserNotifications({
        page: pageParam as number,
        read,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to get a single notification by ID
 * @param notificationId - The notification ID
 */
export const useNotification = (notificationId: string) => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.single(notificationId),
    queryFn: () => NotificationsAPI.getNotificationById(notificationId),
    select: (data) => data.data,
    enabled: !!notificationId,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to get unread notification count
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount,
    queryFn: async () => {
      const response = await NotificationsAPI.getUserNotifications({
        page: 1,
        limit: 1,
        read: false,
      })
      return response.pagination.total
    },
    refetchInterval: 1000 * 60, // Refetch every minute
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry on 400/404 (backend issues)
      if (error instanceof AxiosError) {
        const status = error.response?.status
        if (status === 400 || status === 404) {
          return false
        }
      }
      return failureCount < 1
    },
    // Return 0 if API fails
    placeholderData: 0,
  })
}

/**
 * Hook to mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => NotificationsAPI.markAsRead(notificationId),
    onSuccess: (response, notificationId) => {
      // Invalidate all notification queries to refresh data
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount })

      // Optionally update cache optimistically for single notification
      qc.setQueryData(NOTIFICATION_KEYS.single(notificationId), response)
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data?.message ?? "Failed to mark notification as read")
      } else {
        toast.error("Failed to mark notification as read")
      }
    },
  })
}

/**
 * Hook to mark notification as unread
 */
export const useMarkNotificationAsUnread = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => NotificationsAPI.markAsUnread(notificationId),
    onSuccess: (response, notificationId) => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount })
      qc.setQueryData(NOTIFICATION_KEYS.single(notificationId), response)
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(
          err?.response?.data?.message ?? "Failed to mark notification as unread"
        )
      } else {
        toast.error("Failed to mark notification as unread")
      }
    },
  })
}

/**
 * Hook to toggle notification read status
 */
export const useToggleNotificationReadStatus = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      notificationId,
      isRead,
    }: {
      notificationId: string
      isRead: boolean
    }) =>
      NotificationsAPI.updateNotificationReadStatus(notificationId, { is_read: isRead }),
    onSuccess: (response, { notificationId }) => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount })
      qc.setQueryData(NOTIFICATION_KEYS.single(notificationId), response)
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data?.message ?? "Failed to update notification")
      } else {
        toast.error("Failed to update notification")
      }
    },
  })
}
// // FILE: src/hooks/use-notifications.ts

// "use client"

// import {
//   useInfiniteQuery,
//   useQuery,
//   useMutation,
//   useQueryClient,
// } from "@tanstack/react-query"
// import {
//   NotificationsAPI,
//   GetNotificationsResponse,
//   // Notification,
// } from "@/lib/notifications"
// import { toast } from "sonner"
// import { AxiosError } from "axios"

// // QUERY KEYS
// export const NOTIFICATION_KEYS = {
//   all: ["notifications"],
//   infinite: (read?: boolean) => ["notifications", "infinite", { read }],
//   single: (id: string) => ["notification", id],
//   unreadCount: ["notifications", "unread-count"],
// }

// /**
//  * Hook to get paginated notifications with infinite scroll
//  * @param read - Optional filter for read/unread notifications
//  */
// export const useNotifications = (read?: boolean) => {
//   return useInfiniteQuery<GetNotificationsResponse, Error>({
//     queryKey: NOTIFICATION_KEYS.infinite(read),
//     queryFn: async ({ pageParam = 1 }) => {
//       return NotificationsAPI.getUserNotifications({
//         page: pageParam as number,
//         read,
//       })
//     },
//     initialPageParam: 1,
//     getNextPageParam: (lastPage) => {
//       return lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined
//     },
//     staleTime: 1000 * 60, // 1 minute
//   })
// }

// /**
//  * Hook to get a single notification by ID
//  * @param notificationId - The notification ID
//  */
// export const useNotification = (notificationId: string) => {
//   return useQuery({
//     queryKey: NOTIFICATION_KEYS.single(notificationId),
//     queryFn: () => NotificationsAPI.getNotificationById(notificationId),
//     select: (data) => data.data,
//     enabled: !!notificationId,
//     staleTime: 1000 * 30, // 30 seconds
//   })
// }

// /**
//  * Hook to get unread notification count
//  */
// export const useUnreadNotificationCount = () => {
//   return useQuery({
//     queryKey: NOTIFICATION_KEYS.unreadCount,
//     queryFn: async () => {
//       const response = await NotificationsAPI.getUserNotifications({
//         page: 1,
//         limit: 1,
//         read: false,
//       })
//       return response.pagination.total
//     },
//     refetchInterval: 1000 * 60, // Refetch every minute
//     refetchOnWindowFocus: true,
//   })
// }

// /**
//  * Hook to mark notification as read
//  */
// export const useMarkNotificationAsRead = () => {
//   const qc = useQueryClient()

//   return useMutation({
//     mutationFn: (notificationId: string) => NotificationsAPI.markAsRead(notificationId),
//     onSuccess: (response, notificationId) => {
//       // Invalidate all notification queries to refresh data
//       qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
//       qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount })

//       // Optionally update cache optimistically for single notification
//       qc.setQueryData(NOTIFICATION_KEYS.single(notificationId), response)
//     },
//     onError: (err) => {
//       if (err instanceof AxiosError) {
//         toast.error(err?.response?.data?.message ?? "Failed to mark notification as read")
//       } else {
//         toast.error("Failed to mark notification as read")
//       }
//     },
//   })
// }

// /**
//  * Hook to mark notification as unread
//  */
// export const useMarkNotificationAsUnread = () => {
//   const qc = useQueryClient()

//   return useMutation({
//     mutationFn: (notificationId: string) => NotificationsAPI.markAsUnread(notificationId),
//     onSuccess: (response, notificationId) => {
//       qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
//       qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount })
//       qc.setQueryData(NOTIFICATION_KEYS.single(notificationId), response)
//     },
//     onError: (err) => {
//       if (err instanceof AxiosError) {
//         toast.error(
//           err?.response?.data?.message ?? "Failed to mark notification as unread"
//         )
//       } else {
//         toast.error("Failed to mark notification as unread")
//       }
//     },
//   })
// }

// /**
//  * Hook to toggle notification read status
//  */
// export const useToggleNotificationReadStatus = () => {
//   const qc = useQueryClient()

//   return useMutation({
//     mutationFn: ({
//       notificationId,
//       isRead,
//     }: {
//       notificationId: string
//       isRead: boolean
//     }) =>
//       NotificationsAPI.updateNotificationReadStatus(notificationId, { is_read: isRead }),
//     onSuccess: (response, { notificationId }) => {
//       qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
//       qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount })
//       qc.setQueryData(NOTIFICATION_KEYS.single(notificationId), response)
//     },
//     onError: (err) => {
//       if (err instanceof AxiosError) {
//         toast.error(err?.response?.data?.message ?? "Failed to update notification")
//       } else {
//         toast.error("Failed to update notification")
//       }
//     },
//   })
// }
// // "use client"
// // import { useInfiniteQuery } from "@tanstack/react-query"
// // import { NotificationsAPI, GetNotificationsResponse } from "@/lib/notifications"

// // export const useNotifications = () => {
// //   return useInfiniteQuery<GetNotificationsResponse, Error>({
// //     queryKey: ["notifications"],
// //     queryFn: async ({ pageParam }) => {
// //       return NotificationsAPI.getUserNotifications({ page: pageParam as number })
// //     },
// //     initialPageParam: 1,
// //     getNextPageParam: (lastPage) => {
// //       return lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined
// //     },
// //     staleTime: 1000 * 60,
// //   })
// // }
