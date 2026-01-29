// frontend/src/types/notifications.ts
/* =====================================================
 * Re-export all types from API layer for convenience
 * This keeps the types DRY and ensures consistency
 * ===================================================== */

export type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
  TemplateType,
  TemplateCategory,
  TemplateLanguage,
  SMSProvider,
  SMSStatus,
  NotificationRecipient,
  NotificationSender,
  Notification,
  NotificationListResponse,
  Template,
  TemplateListResponse,
  SMSLog,
  SMSLogListResponse,
  SMSLogDetailResponse,
  NotificationStats,
  SMSStats,
  CreateNotificationPayload,
  BulkNotificationPayload,
  TestNotificationPayload,
  SendNotificationPayload,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  TemplatePreviewPayload,
  TemplatePreviewResponse,
  SendBulkNotificationsResponse,
  NotificationFilters,
  TemplateFilters,
  SMSLogFilters,
} from '@/lib/api/notifications'

/* =====================================================
 * Additional UI-specific types
 * ===================================================== */

export interface NotificationUI {
  id: number
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning' | 'notification'
  channel: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  autoClose?: number
}

export interface NotificationAlert {
  id?: string
  type: 'success' | 'error' | 'info' | 'warning'
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

export interface TemplateVariable {
  name: string
  description?: string
  example?: string
  required?: boolean
}

export interface NotificationTemplate {
  id: number
  name: string
  type: string
  variables: TemplateVariable[]
  preview: string
}

/* =====================================================
 * Helper type guards
 * ===================================================== */

export const isNotification = (value: any): value is Notification => {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'notification_type' in value &&
    'status' in value
  )
}

export const isTemplate = (value: any): value is Template => {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'template_type' in value
  )
}

export const isSMSLog = (value: any): value is SMSLog => {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'phone_number' in value &&
    'message_id' in value
  )
}