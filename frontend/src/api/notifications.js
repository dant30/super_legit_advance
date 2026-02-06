// frontend/src/api/notifications.js
import axiosInstance from './axios'

class NotificationsAPI {
  constructor() {
    // Single base path for notifications app routes.
    // Backend exposes extras like "stats/", "bulk-send/" relative to /api/notifications/
    this.baseURL = '/notifications'
  }

  // ----- Notifications -----

  async getNotifications(params = {}) {
    // list is at /api/notifications/
    const resp = await axiosInstance.get(`${this.baseURL}/`, { params })
    return resp.data
  }

  async getNotification(id) {
    const resp = await axiosInstance.get(`${this.baseURL}/${id}/`)
    return resp.data
  }

  async createNotification(data) {
    const resp = await axiosInstance.post(`${this.baseURL}/`, data)
    return resp.data
  }

  async sendNotification(id, payload = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/${id}/send/`, payload)
    return resp.data
  }

  async markAsRead(id) {
    const resp = await axiosInstance.patch(`${this.baseURL}/${id}/mark-read/`)
    return resp.data
  }

  async markAllAsRead() {
    const resp = await axiosInstance.post(`${this.baseURL}/mark-all-read/`)
    return resp.data
  }

  async deleteNotification(id) {
    const resp = await axiosInstance.delete(`${this.baseURL}/${id}/`)
    return resp.data
  }

  async getStats(params = {}) {
    const resp = await axiosInstance.get(`${this.baseURL}/stats/`, { params })
    return resp.data
  }

  async bulkSend(data = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/bulk-send/`, data)
    return resp.data
  }

  async sendTestNotification(data = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/test/`, data)
    return resp.data
  }

  // ----- Templates -----

  async getTemplates(params = {}) {
    const resp = await axiosInstance.get(`${this.baseURL}/templates/`, { params })
    return resp.data
  }

  async getTemplate(id) {
    const resp = await axiosInstance.get(`${this.baseURL}/templates/${id}/`)
    return resp.data
  }

  async createTemplate(data = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/templates/create/`, data)
    return resp.data
  }

  async updateTemplate(id, data = {}) {
    const resp = await axiosInstance.patch(`${this.baseURL}/templates/${id}/update/`, data)
    return resp.data
  }

  async previewTemplate(id, context = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/templates/${id}/preview/`, { context })
    return resp.data
  }

  async duplicateTemplate(id, newName) {
    const resp = await axiosInstance.post(`${this.baseURL}/templates/${id}/duplicate/`, { new_name: newName })
    return resp.data
  }

  // ----- SMS Logs -----

  async getSMSLogs(params = {}) {
    const resp = await axiosInstance.get(`${this.baseURL}/sms-logs/`, { params })
    return resp.data
  }

  async getSMSLog(id) {
    const resp = await axiosInstance.get(`${this.baseURL}/sms-logs/${id}/`)
    return resp.data
  }

  async getSMSStats(params = {}) {
    const resp = await axiosInstance.get(`${this.baseURL}/sms-logs/stats/`, { params })
    return resp.data
  }

  // ----- Utilities -----

  _handleError(err) {
    // keep a normalized Error
    if (err?.response?.data) {
      const payload = err.response.data
      const msg = payload.detail || payload.error || payload.message || JSON.stringify(payload)
      return new Error(msg)
    }
    if (err?.message) return new Error(err.message)
    return new Error('Unknown notifications API error')
  }

  formatNotification(n) {
    if (!n) return n
    return {
      ...n,
      sent_at: n.sent_at ? new Date(n.sent_at) : null,
      delivered_at: n.delivered_at ? new Date(n.delivered_at) : null,
      read_at: n.read_at ? new Date(n.read_at) : null,
      scheduled_for: n.scheduled_for ? new Date(n.scheduled_for) : null,
      cost: typeof n.cost === 'number' ? n.cost : Number(n.cost || 0),
    }
  }

  getTypeDisplay(type) {
    const map = {
      LOAN_APPROVED: 'Loan Approved',
      LOAN_REJECTED: 'Loan Rejected',
      LOAN_DISBURSED: 'Loan Disbursed',
      PAYMENT_REMINDER: 'Payment Reminder',
      PAYMENT_RECEIVED: 'Payment Received',
      PAYMENT_OVERDUE: 'Payment Overdue',
      ACCOUNT_UPDATE: 'Account Update',
      SYSTEM_ALERT: 'System Alert',
      MARKETING: 'Marketing',
      OTHER: 'Other',
    }
    return map[type] || type
  }
}

export const notificationsAPI = new NotificationsAPI()
export default notificationsAPI