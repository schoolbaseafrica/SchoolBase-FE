// FILE: src/lib/notifications.ts

import { apiFetch } from "@/lib/api/client"

export interface Notification {
  id: string
  recipient_id: string
  type: "SYSTEM_ALERT" | "ASSIGNMENT" | "GRADE_POSTED" | "ANNOUNCEMENT" | string
  title: string
  message: string
  is_read: boolean
  metadata: Record<string, unknown>
  action_url?: string
  created_at: string
  updated_at: string
}

export interface NotificationsPagination {
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface GetNotificationsResponse {
  message: string
  data: {
    notifications: Notification[]
  }
  pagination: NotificationsPagination
}

export interface GetNotificationsParams {
  page?: number
  limit?: number
  read?: boolean
}

export interface UpdateNotificationReadStatusPayload {
  is_read: boolean
}

type ResponsePack<T> = {
  message: string
  data: T
}

export const NotificationsAPI = {
  // Get paginated user notifications
  getUserNotifications: (params?: GetNotificationsParams) =>
    apiFetch<GetNotificationsResponse>(
      "/notifications/user",
      {
        method: "GET",
        params,
      },
      true
    ),

  // Get single notification by ID
  getNotificationById: (notificationId: string) =>
    apiFetch<ResponsePack<Notification>>(
      `/notifications/${notificationId}`,
      {
        method: "GET",
      },
      true
    ),

  // Update notification read status
  updateNotificationReadStatus: (
    notificationId: string,
    payload: UpdateNotificationReadStatusPayload
  ) =>
    apiFetch<ResponsePack<Notification>>(
      `/notifications/${notificationId}`,
      {
        method: "PATCH",
        data: payload,
      },
      true
    ),

  // Mark notification as read (convenience method)
  markAsRead: (notificationId: string) =>
    NotificationsAPI.updateNotificationReadStatus(notificationId, { is_read: true }),

  // Mark notification as unread (convenience method)
  markAsUnread: (notificationId: string) =>
    NotificationsAPI.updateNotificationReadStatus(notificationId, { is_read: false }),
}
// import { apiFetch } from "@/lib/api/client"

// export interface Notification {
//   id: string
//   recipient_id: string
//   type: string
//   title: string
//   message: string
//   is_read: boolean
//   metadata: Record<string, unknown>
//   action_url?: string
//   created_at: string
//   updated_at: string
// }

// export interface NotificationsPagination {
//   total: number
//   page: number
//   limit: number
//   total_pages: number
//   has_next: boolean
//   has_previous: boolean
// }

// export interface GetNotificationsResponse {
//   message: string
//   data: {
//     notifications: Notification[]
//   }
//   pagination: NotificationsPagination
// }

// export interface GetNotificationsParams {
//   page?: number
//   read?: boolean
// }

// export const NotificationsAPI = {
//   getUserNotifications: (params?: GetNotificationsParams) =>
//     apiFetch<GetNotificationsResponse>(
//       "/notifications/user",
//       {
//         method: "GET",
//         params,
//       },
//       true
//     ),
// }
