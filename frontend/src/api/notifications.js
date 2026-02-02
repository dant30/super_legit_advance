// frontend/src/api/notifications.js
import axiosInstance from './axios'

/* =====================================================
 * Constants
 * ===================================================== */

export const NOTIFICATION_CHANNELS = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP',
  WHATSAPP: 'WHATSAPP'
}

export const NOTIFICATION_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
}

export const NOTIFICATION_STATUSES = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  ARCHIVED: 'ARCHIVED'
}

export const NOTIFICATION_TYPES = {
  LOAN_APPROVED: 'LOAN_APPROVED',
  LOAN_REJECTED: 'LOAN_REJECTED',
  LOAN_DISBURSED: 'LOAN_DISBURSED',
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_OVERDUE: 'PAYMENT_OVERDUE',
  ACCOUNT_UPDATE: 'ACCOUNT_UPDATE',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  MARKETING: 'MARKETING',
  OTHER: 'OTHER'
}

export const TEMPLATE_TYPES = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
  WHATSAPP: 'WHATSAPP'
}

export const TEMPLATE_CATEGORIES = {
  LOAN: 'LOAN',
  PAYMENT: 'PAYMENT',
  ACCOUNT: 'ACCOUNT',
  MARKETING: 'MARKETING',
  ALERT: 'ALERT',
  OTHER: 'OTHER'
}

export const SMS_PROVIDERS = {
  AFRICASTALKING: 'AFRICASTALKING',
  TWILIO: 'TWILIO',
  NEXMO: 'NEXMO',
  INFOBIP: 'INFOBIP',
  BULKSMS: 'BULKSMS',
  OTHER: 'OTHER'
}

export const SMS_STATUSES = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
  UNDELIVERED: 'UNDELIVERED'
}

/* =====================================================
 * Notifications API Class
 * ===================================================== */

class NotificationsAPI {
  constructor() {
    this.baseURL = '/notifications'
  }

  /* ===== NOTIFICATIONS ===== */

  async getNotifications(params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/notifications/`, { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getNotification(id) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/notifications/${id}/`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async createNotification(data) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/notifications/`, data)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async sendNotification(id, payload = {}) {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/notifications/${id}/send/`,
        payload
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async markAsRead(id) {
    try {
      const response = await axiosInstance.patch(
        `${this.baseURL}/notifications/${id}/mark-read/`
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async markAllAsRead() {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/notifications/mark-all-read/`
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async deleteNotification(id) {
    try {
      const response = await axiosInstance.delete(
        `${this.baseURL}/notifications/${id}/`
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/notifications/stats/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async sendBulkNotifications(data) {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/notifications/bulk-send/`,
        data
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async sendTestNotification(data) {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/notifications/test/`,
        data
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /* ===== TEMPLATES ===== */

  async getTemplates(params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/templates/`, { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getTemplate(id) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/templates/${id}/`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async createTemplate(data) {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/templates/create/`,
        data
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async updateTemplate(id, data) {
    try {
      const response = await axiosInstance.patch(
        `${this.baseURL}/templates/${id}/update/`,
        data
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async deleteTemplate(id) {
    try {
      const response = await axiosInstance.delete(
        `${this.baseURL}/templates/${id}/`
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async previewTemplate(id, context = {}) {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/templates/${id}/preview/`,
        { context }
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async duplicateTemplate(id, newName) {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/templates/${id}/duplicate/`,
        { new_name: newName }
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /* ===== SMS LOGS ===== */

  async getSMSLogs(params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/sms-logs/`, { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getSMSLog(id) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/sms-logs/${id}/`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getSMSStats(params = {}) {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/sms-logs/stats/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  /* ===== UTILITY METHODS ===== */

  _handleError(error) {
    console.error('Notifications API Error:', error)
    
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.detail || 
                     error.response.data?.message || 
                     error.response.data?.error ||
                     'An error occurred'
      
      return new Error(message)
    } else if (error.request) {
      // No response received
      return new Error('No response from server. Please check your connection.')
    } else {
      // Request setup error
      return new Error(error.message || 'An unexpected error occurred')
    }
  }

  // Helper method to format notification data
  formatNotificationData(data) {
    return {
      ...data,
      created_at: data.created_at ? new Date(data.created_at) : null,
      sent_at: data.sent_at ? new Date(data.sent_at) : null,
      delivered_at: data.delivered_at ? new Date(data.delivered_at) : null,
      read_at: data.read_at ? new Date(data.read_at) : null,
    }
  }

  // Helper method to get notification display text
  getNotificationTypeDisplay(type) {
    const displayMap = {
      [NOTIFICATION_TYPES.LOAN_APPROVED]: 'Loan Approved',
      [NOTIFICATION_TYPES.LOAN_REJECTED]: 'Loan Rejected',
      [NOTIFICATION_TYPES.LOAN_DISBURSED]: 'Loan Disbursed',
      [NOTIFICATION_TYPES.PAYMENT_REMINDER]: 'Payment Reminder',
      [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: 'Payment Received',
      [NOTIFICATION_TYPES.PAYMENT_OVERDUE]: 'Payment Overdue',
      [NOTIFICATION_TYPES.ACCOUNT_UPDATE]: 'Account Update',
      [NOTIFICATION_TYPES.SYSTEM_ALERT]: 'System Alert',
      [NOTIFICATION_TYPES.MARKETING]: 'Marketing',
      [NOTIFICATION_TYPES.OTHER]: 'Other',
    }
    return displayMap[type] || type
  }

  getNotificationStatusDisplay(status) {
    const displayMap = {
      [NOTIFICATION_STATUSES.PENDING]: 'Pending',
      [NOTIFICATION_STATUSES.SENT]: 'Sent',
      [NOTIFICATION_STATUSES.FAILED]: 'Failed',
      [NOTIFICATION_STATUSES.DELIVERED]: 'Delivered',
      [NOTIFICATION_STATUSES.READ]: 'Read',
      [NOTIFICATION_STATUSES.ARCHIVED]: 'Archived',
    }
    return displayMap[status] || status
  }

  getNotificationPriorityDisplay(priority) {
    const displayMap = {
      [NOTIFICATION_PRIORITIES.LOW]: 'Low',
      [NOTIFICATION_PRIORITIES.MEDIUM]: 'Medium',
      [NOTIFICATION_PRIORITIES.HIGH]: 'High',
      [NOTIFICATION_PRIORITIES.URGENT]: 'Urgent',
    }
    return displayMap[priority] || priority
  }
}

/* =====================================================
 * Export singleton
 * ===================================================== */

export const notificationsAPI = new NotificationsAPI()
export default notificationsAPI