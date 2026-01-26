// frontend/src/types/notifications.ts
// frontend/src/types/notifications.ts
export type NotificationChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP' | 'WHATSAPP'
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'READ' | 'ARCHIVED'

export interface NotificationRecipient {
  id?: number
  name: string
  phone?: string
  email?: string
  username?: string
  is_staff?: boolean
  is_customer?: boolean
}

export interface Notification {
  id: number
  notification_type: string
  notification_type_display: string
  channel: NotificationChannel
  channel_display: string
  priority: NotificationPriority
  priority_display: string
  title: string
  message: string
  recipient: number | null
  recipient_info: NotificationRecipient
  recipient_name: string
  recipient_phone: string
  recipient_email: string
  sender: number | null
  sender_info: any
  sender_name: string
  status: NotificationStatus
  status_display: string
  scheduled_for?: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
  delivery_attempts: number
  delivery_error: string
  external_id: string
  cost: number
  related_object_type?: string
  related_object_id?: string
  related_object_info?: any
  template?: number
  template_info?: any
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Template {
  id: number
  name: string
  template_type: 'SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP'
  template_type_display: string
  category: 'LOAN' | 'PAYMENT' | 'ACCOUNT' | 'MARKETING' | 'ALERT' | 'OTHER'
  category_display: string
  language: 'EN' | 'SW'
  language_display: string
  subject: string
  content: string
  variables: string[]
  is_active: boolean
  character_limit: number
  usage_count: number
  last_used?: string
  description: string
  sample_data: Record<string, any>
  sample_render?: string
  stats?: any
  created_at: string
  updated_at: string
}

export interface SMSLog {
  id: number
  notification: number
  phone_number: string
  message: string
  message_id: string
  provider: 'AFRICASTALKING' | 'TWILIO' | 'NEXMO' | 'INFOBIP' | 'BULKSMS' | 'OTHER'
  provider_display: string
  status: string
  status_display: string
  status_message: string
  units: number
  cost: number
  sent_at?: string
  delivered_at?: string
  network_code: string
  network_name: string
  metadata: Record<string, any>
  notification_info?: any
  stats?: any
  created_at: string
  updated_at: string
}

export interface Stats {
  overall: {
    total_notifications: number
    notifications_last_period: number
    total_cost: number
    average_cost: number
  }
  status_distribution: Array<{ status: string; count: number }>
  channel_distribution: Array<{ channel: string; count: number }>
  type_distribution: Array<{ notification_type: string; count: number }>
  daily_stats: Array<any>
  time_period_days: number
}