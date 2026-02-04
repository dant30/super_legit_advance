// frontend/src/api/mpesa.js
import axiosInstance from './axios'

class MpesaAPI {
  constructor() {
    this.baseURL = '/mpesa'
  }

  // Initiate STK push (matches STKPushInitiateView)
  async initiateSTKPush(data) {
    const resp = await axiosInstance.post(`${this.baseURL}/stk-push/initiate/`, data)
    return resp.data
  }

  // Get payment status by payment_reference or checkout_request_id
  async getPaymentStatus(paymentReference = null, checkoutRequestId = null) {
    if (paymentReference) {
      const resp = await axiosInstance.get(`${this.baseURL}/payment/status/${encodeURIComponent(paymentReference)}/`)
      return resp.data
    }
    if (checkoutRequestId) {
      const resp = await axiosInstance.get(`${this.baseURL}/payment/status/`, {
        params: { checkout_request_id: checkoutRequestId }
      })
      return resp.data
    }
    throw new Error('paymentReference or checkoutRequestId is required')
  }

  // Paginated payment history (matches PaymentHistoryView)
  async getPaymentHistory(params = {}) {
    const resp = await axiosInstance.get(`${this.baseURL}/payment/history/`, { params })
    return resp.data
  }

  // Transactions list (TransactionListView)
  async getTransactions(params = {}) {
    const resp = await axiosInstance.get(`${this.baseURL}/transactions/`, { params })
    return resp.data
  }

  // Transaction detail (TransactionDetailView)
  async getTransaction(receiptNumber) {
    const resp = await axiosInstance.get(`${this.baseURL}/transactions/${encodeURIComponent(receiptNumber)}/`)
    return resp.data
  }

  // Retry a failed payment (PaymentRetryView)
  async retryPayment(paymentId, data = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/payment/${paymentId}/retry/`, data)
    return resp.data
  }

  // Reverse a successful payment (PaymentReversalView)
  async reversePayment(receiptNumber, data = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/payment/${encodeURIComponent(receiptNumber)}/reverse/`, data)
    return resp.data
  }

  // Summary analytics (PaymentSummaryView)
  async getPaymentSummary(days = 30) {
    const resp = await axiosInstance.get(`${this.baseURL}/summary/`, { params: { days } })
    return resp.data
  }

  // Test webhook (PaymentWebhookTestView)
  async testWebhook(type = 'stk_push', data = {}) {
    const resp = await axiosInstance.post(`${this.baseURL}/webhook/test/`, { type, data })
    return resp.data
  }

  // Polling helper (delegates to backend polling but keeps client-side wrapper)
  async pollPaymentStatus(checkoutRequestId, interval = 3000, maxAttempts = 20) {
    let attempts = 0
    return new Promise((resolve, reject) => {
      const tick = async () => {
        attempts += 1
        try {
          const result = await this.getPaymentStatus(null, checkoutRequestId)
          // backend returns { success: true, payment: {...} } on PaymentStatusView
          const payment = result?.payment || result
          const status = payment?.status || payment?.payment?.status
          if (status === 'SUCCESSFUL' || status === 'FAILED' || status === 'CANCELLED' || status === 'TIMEOUT') {
            resolve(result)
            return
          }
          if (attempts >= maxAttempts) {
            reject(new Error('Polling timeout'))
            return
          }
          setTimeout(tick, interval)
        } catch (err) {
          reject(err)
        }
      }
      tick()
    })
  }

  // Export payments (blob)
  async exportPayments(format = 'csv', params = {}) {
    const resp = await axiosInstance.get(`${this.baseURL}/payment/export/`, {
      params: { format, ...params },
      responseType: 'blob'
    })
    return resp.data
  }
}

export const mpesaAPI = new MpesaAPI()
export default mpesaAPI