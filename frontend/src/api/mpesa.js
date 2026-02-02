// frontend/src/api/mpesa.js
import axiosInstance from './axios'

class MpesaAPI {
  constructor() {
    this.baseURL = '/mpesa'
  }

  /**
   * STK Push - Initiate payment request
   */
  async initiateSTKPush(data) {
    const response = await axiosInstance.post(`${this.baseURL}/stk-push/initiate/`, data)
    return response.data
  }

  /**
   * Payment Status - Check payment status by reference or checkout request ID
   */
  async getPaymentStatus(paymentReference, checkoutRequestId) {
    if (paymentReference) {
      const response = await axiosInstance.get(
        `${this.baseURL}/payment/status/${paymentReference}/`
      )
      return response.data
    } else if (checkoutRequestId) {
      const response = await axiosInstance.get(`${this.baseURL}/payment/status/`, {
        params: { checkout_request_id: checkoutRequestId }
      })
      return response.data
    } else {
      throw new Error('Either payment_reference or checkout_request_id is required')
    }
  }

  /**
   * Payment History - Get paginated payment history with filters
   */
  async getPaymentHistory(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/payment/history/`, { params })
    return response.data
  }

  /**
   * Transactions - Get all transactions
   */
  async getTransactions(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/transactions/`, { params })
    return response.data
  }

  /**
   * Transaction Detail - Get single transaction by receipt number
   */
  async getTransaction(receiptNumber) {
    const response = await axiosInstance.get(
      `${this.baseURL}/transactions/${receiptNumber}/`
    )
    return response.data
  }

  /**
   * Payment Retry - Retry failed payment
   */
  async retryPayment(paymentId, data) {
    const response = await axiosInstance.post(
      `${this.baseURL}/payment/${paymentId}/retry/`,
      data
    )
    return response.data
  }

  /**
   * Payment Reversal - Reverse successful payment
   */
  async reversePayment(receiptNumber, data) {
    const response = await axiosInstance.post(
      `${this.baseURL}/payment/${receiptNumber}/reverse/`,
      data
    )
    return response.data
  }

  /**
   * Payment Summary - Get payment statistics and analytics
   */
  async getPaymentSummary(days) {
    const response = await axiosInstance.get(`${this.baseURL}/summary/`, {
      params: { days }
    })
    return response.data
  }

  /**
   * Webhook Test - Test webhook endpoints (admin only)
   */
  async testWebhook(type, data) {
    const response = await axiosInstance.post(`${this.baseURL}/webhook/test/`, {
      type,
      data
    })
    return response.data
  }

  /**
   * Poll Payment Status - Continuously poll for payment status
   */
  async pollPaymentStatus(checkoutRequestId, interval = 3000, maxAttempts = 20) {
    return new Promise((resolve, reject) => {
      let attempts = 0
      
      const poll = async () => {
        attempts++
        
        try {
          const result = await this.getPaymentStatus(null, checkoutRequestId)
          
          if (result.payment.status === 'SUCCESSFUL' || result.payment.status === 'FAILED') {
            resolve(result)
          } else if (attempts >= maxAttempts) {
            reject(new Error('Payment status polling timeout'))
          } else {
            setTimeout(poll, interval)
          }
        } catch (error) {
          reject(error)
        }
      }
      
      poll()
    })
  }

  /**
   * Export Payment History - Export payments to CSV/Excel
   */
  async exportPayments(format = 'csv', params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/payment/export/`, {
      params: { format, ...params },
      responseType: 'blob'
    })
    return response.data
  }
}

export const mpesaAPI = new MpesaAPI()