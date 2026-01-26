// frontend/src/hooks/useMpesa.ts
import { useState, useCallback } from 'react'
import { mpesaAPI } from '@/lib/api/mpesa'
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

export const useMpesa = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiateSTKPush = useCallback(async (data: STKPushRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.initiateSTKPush(data)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentStatus = useCallback(async (paymentReference?: string, checkoutRequestId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.getPaymentStatus(paymentReference, checkoutRequestId)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get payment status'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentHistory = useCallback(async (params?: PaymentHistoryParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.getPaymentHistory(params)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get payment history'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getTransactions = useCallback(async (params?: TransactionListParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.getTransactions(params)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get transactions'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getTransaction = useCallback(async (receiptNumber: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.getTransaction(receiptNumber)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get transaction'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const retryPayment = useCallback(async (paymentId: number, data: PaymentRetryRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.retryPayment(paymentId, data)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to retry payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const reversePayment = useCallback(async (receiptNumber: string, data: PaymentReversalRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.reversePayment(receiptNumber, data)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to reverse payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentSummary = useCallback(async (days?: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.getPaymentSummary(days)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get payment summary'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const testWebhook = useCallback(async (type: 'stk_push' | 'c2b_validation', data?: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mpesaAPI.testWebhook(type, data)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to test webhook'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    clearError,
    initiateSTKPush,
    getPaymentStatus,
    getPaymentHistory,
    getTransactions,
    getTransaction,
    retryPayment,
    reversePayment,
    getPaymentSummary,
    testWebhook
  }
}