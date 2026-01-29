// frontend/src/lib/api/mpesa.ts
import axiosInstance from '@/lib/axios'
import {
  STKPushRequest,
  MpesaPayment,
  MpesaTransaction,
  PaymentSummary,
  PaginatedResponse,
  PaymentHistoryParams,
  TransactionListParams,
  PaymentRetryRequest,
  PaymentReversalRequest
} from '@/types/mpesa'

class MpesaAPI {
  private baseURL = '/mpesa'

  /**
   * STK Push - Initiate payment request
   */
  async initiateSTKPush(data: STKPushRequest): Promise<{
    success: boolean
    message: string
    payment_reference: string
    checkout_request_id: string
    merchant_request_id: string
    payment_id: number
    instructions: string
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/stk-push/initiate/`, data)
    return response.data
  }

  /**
   * Payment Status - Check payment status by reference or checkout request ID
   */
  async getPaymentStatus(paymentReference?: string, checkoutRequestId?: string): Promise<{
    success: boolean
    payment: MpesaPayment
  }> {
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
  async getPaymentHistory(params?: PaymentHistoryParams): Promise<PaginatedResponse<MpesaPayment>> {
    const response = await axiosInstance.get(`${this.baseURL}/payment/history/`, { params })
    return response.data
  }

  /**
   * Transactions - Get all transactions
   */
  async getTransactions(params?: TransactionListParams): Promise<PaginatedResponse<MpesaTransaction>> {
    const response = await axiosInstance.get(`${this.baseURL}/transactions/`, { params })
    return response.data
  }

  /**
   * Transaction Detail - Get single transaction by receipt number
   */
  async getTransaction(receiptNumber: string): Promise<MpesaTransaction> {
    const response = await axiosInstance.get(
      `${this.baseURL}/transactions/${receiptNumber}/`
    )
    return response.data
  }

  /**
   * Payment Retry - Retry failed payment
   */
  async retryPayment(paymentId: number, data: PaymentRetryRequest): Promise<{
    success: boolean
    message: string
    new_payment_id: number
    new_payment_reference: string
    retry_count: number
  }> {
    const response = await axiosInstance.post(
      `${this.baseURL}/payment/${paymentId}/retry/`,
      data
    )
    return response.data
  }

  /**
   * Payment Reversal - Reverse successful payment
   */
  async reversePayment(receiptNumber: string, data: PaymentReversalRequest): Promise<{
    success: boolean
    message: string
    transaction_id: string
    receipt_number: string
    status: string
  }> {
    const response = await axiosInstance.post(
      `${this.baseURL}/payment/${receiptNumber}/reverse/`,
      data
    )
    return response.data
  }

  /**
   * Payment Summary - Get payment statistics and analytics
   */
  async getPaymentSummary(days?: number): Promise<PaymentSummary> {
    const response = await axiosInstance.get(`${this.baseURL}/summary/`, {
      params: { days }
    })
    return response.data
  }

  /**
   * Webhook Test - Test webhook endpoints (admin only)
   */
  async testWebhook(type: 'stk_push' | 'c2b_validation', data?: any): Promise<{
    success: boolean
    message: string
    callback_processed?: boolean
    callback_id?: number
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/webhook/test/`, {
      type,
      data
    })
    return response.data
  }
}

export const mpesaAPI = new MpesaAPI()