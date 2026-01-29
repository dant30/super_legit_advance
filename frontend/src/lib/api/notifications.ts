// frontend/src/lib/api/notifications.ts
import axiosInstance from '@/lib/axios'

/* =====================================================
 * Core Types
 * ===================================================== */

export type NotificationChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP' | 'WHATSAPP'
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'READ' | 'ARCHIVED'
export type NotificationType = 
  | 'LOAN_APPROVED'
  | 'LOAN_REJECTED'
  | 'LOAN_DISBURSED'
  | 'PAYMENT_REMINDER'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'ACCOUNT_UPDATE'
  | 'SYSTEM_ALERT'
  | 'MARKETING'
  | 'OTHER'

export type TemplateType = 'SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP'
export type TemplateCategory = 'LOAN' | 'PAYMENT' | 'ACCOUNT' | 'MARKETING' | 'ALERT' | 'OTHER'
export type TemplateLanguage = 'EN' | 'SW'

export type SMSProvider = 'AFRICASTALKING' | 'TWILIO' | 'NEXMO' | 'INFOBIP' | 'BULKSMS' | 'OTHER'
export type SMSStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'REJECTED' | 'UNDELIVERED'

/* =====================================================
 * Recipient & Sender Types
 * ===================================================== */

export interface NotificationRecipient {
  id?: number
  name: string
  phone?: string
  email?: string
  username?: string
  is_staff?: boolean
  is_customer?: boolean
}

export interface NotificationSender {
  id: number
  name: string
  email: string
  phone?: string
  is_staff: boolean
}

/* =====================================================
 * Notification Types
 * ===================================================== */

export interface Notification {
  id: number
  notification_type: NotificationType
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
  sender_info: NotificationSender | null
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
  related_object_info?: Record<string, any>
  template?: number
  template_info?: {
    id: number
    name: string
    type: TemplateType
    category: TemplateCategory
  }
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface NotificationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notification[]
}

/* =====================================================
 * Template Types
 * ===================================================== */

export interface Template {
  id: number
  name: string
  template_type: TemplateType
  template_type_display: string
  category: TemplateCategory
  category_display: string
  language: TemplateLanguage
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
  stats?: {
    total_used: number
    notifications_count: number
    success_rate: number
    last_used?: string
  }
  created_at: string
  updated_at: string
}

export interface TemplateListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Template[]
}

/* =====================================================
 * SMS Log Types
 * ===================================================== */

export interface SMSLog {
  id: number
  phone_number: string
  message: string
  message_id: string
  provider: SMSProvider
  provider_display: string
  status: SMSStatus
  status_display: string
  status_message: string
  units: number
  cost: number
  sent_at?: string
  delivered_at?: string
  network_code: string
  network_name: string
  notification_id: number
  notification_type: NotificationType
  notification_type_display: string
  recipient_name: string
  delivery_time?: number
  created_at: string
  updated_at?: string
}

export interface SMSLogListResponse {
  count: number
  next: string | null
  previous: string | null
  results: SMSLog[]
}

export interface SMSLogDetailResponse extends SMSLog {
  notification_info?: Notification
  stats?: {
    message_length: number
    units_used: number
    cost: number
    delivery_time?: number
    provider: string
    network: string
  }
}

/* =====================================================
 * Statistics Types
 * ===================================================== */

export interface NotificationStats {
  overall: {
    total_notifications: number
    notifications_last_period: number
    total_cost: number
    average_cost: number
  }
  status_distribution: Array<{ status: string; count: number }>
  channel_distribution: Array<{ channel: string; count: number }>
  type_distribution: Array<{ notification_type: string; count: number }>
  daily_stats: Array<{
    date: string
    total: number
    sent: number
    success_rate: number
  }>
  time_period_days: number
}

export interface SMSStats {
  overall: {
    total_sms: number
    sms_last_period: number
    total_cost: number
    total_units: number
    avg_cost_per_sms: number
    delivery_rate: number
    avg_delivery_time_seconds?: number
  }
  status_distribution: Array<{ status: string; count: number }>
  provider_distribution: Array<{
    provider: string
    count: number
    total_cost: number
    total_units: number
  }>
  daily_stats: Array<{
    date: string
    total_sms: number
    sent_sms: number
    delivered_sms: number
    failed_sms: number
    delivery_rate: number
    total_cost: number
    total_units: number
    avg_cost_per_sms: number
  }>
  time_period_days: number
}

/* =====================================================
 * Request/Response Payload Types
 * ===================================================== */

export interface CreateNotificationPayload {
  notification_type: NotificationType
  channel: NotificationChannel
  priority: NotificationPriority
  title: string
  message?: string
  recipient?: number
  recipient_name?: string
  recipient_phone?: string
  recipient_email?: string
  scheduled_for?: string
  related_object_type?: string
  related_object_id?: string
  metadata?: Record<string, any>
  template_id?: number
  template_context?: Record<string, any>
}

export interface BulkNotificationPayload {
  template_id: number
  recipients: Array<{
    name: string
    phone?: string
    email?: string
    recipient?: number
  }>
  context?: Record<string, any>
}

export interface TestNotificationPayload {
  channel: NotificationChannel
  recipient_phone?: string
  recipient_email?: string
  message: string
}

export interface SendNotificationPayload {
  send_immediately?: boolean
  retry_failed?: boolean
}

export interface CreateTemplatePayload {
  name: string
  template_type: TemplateType
  category: TemplateCategory
  language: TemplateLanguage
  subject?: string
  content: string
  character_limit?: number
  description?: string
  sample_data?: Record<string, any>
}

export interface UpdateTemplatePayload {
  name?: string
  template_type?: TemplateType
  category?: TemplateCategory
  language?: TemplateLanguage
  subject?: string
  content?: string
  is_active?: boolean
  character_limit?: number
  description?: string
  sample_data?: Record<string, any>
}

export interface TemplatePreviewPayload {
  context?: Record<string, any>
}

export interface TemplatePreviewResponse {
  template_id: number
  template_name: string
  rendered_content: string
  rendered_subject?: string
  content_length: number
  variables_used: string[]
  variables_provided: string[]
  character_limit?: number
  within_limit: boolean
}

export interface SendBulkNotificationsResponse {
  total: number
  successful: number
  failed: number
  details: Array<{
    recipient: Record<string, any>
    status: 'success' | 'failed' | 'error'
    notification_id?: number
    error?: string
  }>
}

/* =====================================================
 * API Query Parameters
 * ===================================================== */

export interface NotificationFilters {
  page?: number
  page_size?: number
  notification_type?: NotificationType
  channel?: NotificationChannel
  status?: NotificationStatus
  priority?: NotificationPriority
  recipient_id?: number
  related_type?: string
  related_id?: string
  template_id?: number
  delivered?: boolean
  start_date?: string
  end_date?: string
  search?: string
  ordering?: string
}

export interface TemplateFilters {
  page?: number
  page_size?: number
  template_type?: TemplateType
  category?: TemplateCategory
  language?: TemplateLanguage
  is_active?: boolean
  search?: string
  ordering?: string
}

export interface SMSLogFilters {
  page?: number
  page_size?: number
  status?: SMSStatus
  provider?: SMSProvider
  phone_number?: string
  start_date?: string
  end_date?: string
  min_cost?: number
  max_cost?: number
  search?: string
  ordering?: string
}

/* =====================================================
 * Notifications API Class
 * ===================================================== */

class NotificationsAPI {
  private baseURL = '/notifications'

  /* ===== NOTIFICATIONS ===== */

  async getNotifications(params?: NotificationFilters): Promise<NotificationListResponse> {
    try {
      const response = await axiosInstance.get<NotificationListResponse>(
        `${this.baseURL}/notifications/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getNotification(id: number): Promise<Notification> {
    try {
      const response = await axiosInstance.get<Notification>(
        `${this.baseURL}/notifications/${id}/`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async createNotification(data: CreateNotificationPayload): Promise<Notification> {
    try {
      const response = await axiosInstance.post<Notification>(
        `${this.baseURL}/notifications/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async sendNotification(id: number, payload?: SendNotificationPayload): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/notifications/${id}/send/`,
        payload || {}
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async markAsRead(id: number): Promise<any> {
    try {
      const response = await axiosInstance.patch(
        `${this.baseURL}/notifications/${id}/mark-read/`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async markAllAsRead(): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/notifications/mark-all-read/`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getStats(params?: { days?: number }): Promise<NotificationStats> {
    try {
      const response = await axiosInstance.get<NotificationStats>(
        `${this.baseURL}/notifications/stats/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async sendBulkNotifications(data: BulkNotificationPayload): Promise<SendBulkNotificationsResponse> {
    try {
      const response = await axiosInstance.post<SendBulkNotificationsResponse>(
        `${this.baseURL}/notifications/bulk-send/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async sendTestNotification(data: TestNotificationPayload): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/notifications/test/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /* ===== TEMPLATES ===== */

  async getTemplates(params?: TemplateFilters): Promise<TemplateListResponse> {
    try {
      const response = await axiosInstance.get<TemplateListResponse>(
        `${this.baseURL}/templates/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getTemplate(id: number): Promise<Template> {
    try {
      const response = await axiosInstance.get<Template>(
        `${this.baseURL}/templates/${id}/`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async createTemplate(data: CreateTemplatePayload): Promise<Template> {
    try {
      const response = await axiosInstance.post<Template>(
        `${this.baseURL}/templates/create/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async updateTemplate(id: number, data: UpdateTemplatePayload): Promise<Template> {
    try {
      const response = await axiosInstance.patch<Template>(
        `${this.baseURL}/templates/${id}/update/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async previewTemplate(id: number, payload: TemplatePreviewPayload): Promise<TemplatePreviewResponse> {
    try {
      const response = await axiosInstance.post<TemplatePreviewResponse>(
        `${this.baseURL}/templates/${id}/preview/`,
        payload
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async duplicateTemplate(id: number, newName: string): Promise<Template> {
    try {
      const response = await axiosInstance.post<Template>(
        `${this.baseURL}/templates/${id}/duplicate/`,
        { new_name: newName }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /* ===== SMS LOGS ===== */

  async getSMSLogs(params?: SMSLogFilters): Promise<SMSLogListResponse> {
    try {
      const response = await axiosInstance.get<SMSLogListResponse>(
        `${this.baseURL}/sms-logs/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getSMSLog(id: number): Promise<SMSLogDetailResponse> {
    try {
      const response = await axiosInstance.get<SMSLogDetailResponse>(
        `${this.baseURL}/sms-logs/${id}/`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getSMSStats(params?: { days?: number }): Promise<SMSStats> {
    try {
      const response = await axiosInstance.get<SMSStats>(
        `${this.baseURL}/sms-logs/stats/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }
}

/* =====================================================
 * Export singleton and types
 * ===================================================== */

export const notificationsAPI = new NotificationsAPI()
export type { NotificationsAPI }