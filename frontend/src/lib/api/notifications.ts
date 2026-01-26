// frontend/src/lib/api/notifications.ts
import axiosInstance from '@/lib/axios'

export interface Notification {
  id: number
  notification_type: string
  notification_type_display: string
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP' | 'WHATSAPP'
  channel_display: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  priority_display: string
  title: string
  message: string
  recipient_info: {
    id?: number
    name: string
    phone?: string
    email?: string
  }
  sender_name: string
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'READ' | 'ARCHIVED'
  status_display: string
  scheduled_for?: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
  delivery_attempts: number
  cost: number
  created_at: string
}

export interface NotificationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notification[]
}

export interface Template {
  id: number
  name: string
  template_type: 'SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP'
  template_type_display: string
  category: string
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
}

export interface SMSLog {
  id: number
  phone_number: string
  message: string
  message_id: string
  provider: string
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
  notification_id: number
  notification_type: string
  notification_type_display: string
  recipient_name: string
  created_at: string
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

export interface CreateNotificationData {
  notification_type: string
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP' | 'WHATSAPP'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
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

export interface BulkNotificationData {
  template_id: number
  recipients: Array<{
    name: string
    phone?: string
    email?: string
    recipient?: number
  }>
  context?: Record<string, any>
}

export interface TestNotificationData {
  channel: 'SMS' | 'EMAIL'
  recipient_phone?: string
  recipient_email?: string
  message: string
}

class NotificationsAPI {
  private baseURL = '/notifications'

  // Notifications
  async getNotifications(params?: any): Promise<NotificationListResponse> {
    const response = await axiosInstance.get<NotificationListResponse>(
      `${this.baseURL}/`,
      { params }
    )
    return response.data
  }

  async getNotification(id: number): Promise<any> {
    const response = await axiosInstance.get(`${this.baseURL}/${id}/`)
    return response.data
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const response = await axiosInstance.post<Notification>(
      `${this.baseURL}/create/`,
      data
    )
    return response.data
  }

  async sendNotification(id: number): Promise<any> {
    const response = await axiosInstance.post(
      `${this.baseURL}/${id}/send/`
    )
    return response.data
  }

  async getStats(params?: { days?: number }): Promise<Stats> {
    const response = await axiosInstance.get<Stats>(
      `${this.baseURL}/stats/`,
      { params }
    )
    return response.data
  }

  async sendBulkNotifications(data: BulkNotificationData): Promise<any> {
    const response = await axiosInstance.post(
      `${this.baseURL}/bulk-send/`,
      data
    )
    return response.data
  }

  async sendTestNotification(data: TestNotificationData): Promise<any> {
    const response = await axiosInstance.post(
      `${this.baseURL}/test/`,
      data
    )
    return response.data
  }

  // Templates
  async getTemplates(params?: any): Promise<{ results: Template[] }> {
    const response = await axiosInstance.get<{ results: Template[] }>(
      `${this.baseURL}/templates/`,
      { params }
    )
    return response.data
  }

  async getTemplate(id: number): Promise<Template> {
    const response = await axiosInstance.get<Template>(
      `${this.baseURL}/templates/${id}/`
    )
    return response.data
  }

  async createTemplate(data: Partial<Template>): Promise<Template> {
    const response = await axiosInstance.post<Template>(
      `${this.baseURL}/templates/create/`,
      data
    )
    return response.data
  }

  async updateTemplate(id: number, data: Partial<Template>): Promise<Template> {
    const response = await axiosInstance.patch<Template>(
      `${this.baseURL}/templates/${id}/update/`,
      data
    )
    return response.data
  }

  async previewTemplate(id: number, context: Record<string, any>): Promise<any> {
    const response = await axiosInstance.post(
      `${this.baseURL}/templates/${id}/preview/`,
      { context }
    )
    return response.data
  }

  async duplicateTemplate(id: number, newName: string): Promise<Template> {
    const response = await axiosInstance.post<Template>(
      `${this.baseURL}/templates/${id}/duplicate/`,
      { new_name: newName }
    )
    return response.data
  }

  // SMS Logs
  async getSMSLogs(params?: any): Promise<{ results: SMSLog[] }> {
    const response = await axiosInstance.get<{ results: SMSLog[] }>(
      `${this.baseURL}/sms-logs/`,
      { params }
    )
    return response.data
  }

  async getSMSLog(id: number): Promise<SMSLog> {
    const response = await axiosInstance.get<SMSLog>(
      `${this.baseURL}/sms-logs/${id}/`
    )
    return response.data
  }

  async getSMSStats(params?: { days?: number }): Promise<any> {
    const response = await axiosInstance.get(
      `${this.baseURL}/sms-logs/stats/`,
      { params }
    )
    return response.data
  }

  async markAsRead(id: number): Promise<any> {
    const response = await axiosInstance.patch(
      `${this.baseURL}/${id}/mark-read/`
    )
    return response.data
  }

  async markAllAsRead(): Promise<void> {
    await axiosInstance.post(`${this.baseURL}/mark-all-read/`)
  }
}

export const notificationsAPI = new NotificationsAPI()