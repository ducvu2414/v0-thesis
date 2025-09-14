export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
}

export type NotificationType =
  | "DEADLINE_REMINDER"
  | "SCHEDULE_UPDATE"
  | "REVIEW_ASSIGNED"
  | "SCORE_UPDATED"
  | "STATUS_CHANGED"
  | "CHAT_MESSAGE"
