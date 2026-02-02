// frontend/src/hooks/useMpesa.ts
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { mpesaAPI } from '@/lib/api/mpesa'
import type {
  STKPushRequest,
  PaymentHistoryParams,
  TransactionListParams,
  PaymentRetryRequest,
  PaymentReversalRequest
} from '@/types/mpesa'
import {
  initiateSTKPush,
  fetchPaymentHistory,
  fetchTransactions,
  fetchPaymentSummary,
  fetchPaymentStatus,
  fetchTransaction,
  clearPaymentError,
  clearTransactionError,
  clearSTKPushState,
  clearCurrentPayment,
  clearCurrentTransaction,
  clearSummary
} from '@/store/slices/mpesaSlice'
import { RootState, AppDispatch } from '@/store/store'

/**
 * Custom hook for M-Pesa operations
 * Provides abstraction for Redux dispatch and API calls
 */
export const useMpesa = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Redux state selectors
  const stkPushState = useSelector((state: RootState) => state.mpesa.stkPush)
  const paymentsState = useSelector((state: RootState) => state.mpesa.payments)
  const transactionsState = useSelector((state: RootState) => state.mpesa.transactions)
  const summaryState = useSelector((state: RootState) => state.mpesa.summary)
  const currentPaymentState = useSelector((state: RootState) => state.mpesa.currentPayment)
  const currentTransactionState = useSelector((state: RootState) => state.mpesa.currentTransaction)

  /**
   * Initiate STK Push payment via Redux
   */
  const initiatePayment = useCallback(
    async (data: STKPushRequest) => {
      try {
        const result = await dispatch(initiateSTKPush(data))
        if (result.payload) {
          return result.payload
        }
        throw new Error('Failed to initiate payment')
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate payment'
        throw new Error(errorMessage)
      }
    },
    [dispatch]
  )

  /**
   * Get payment status via Redux
   */
  const getPaymentStatus = useCallback(
    async (paymentReference?: string, checkoutRequestId?: string) => {
      try {
        const result = await dispatch(
          fetchPaymentStatus({
            paymentReference,
            checkoutRequestId
          })
        )
        if (result.payload) {
          return result.payload
        }
        throw new Error('Failed to get payment status')
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to get payment status'
        throw new Error(errorMessage)
      }
    },
    [dispatch]
  )

  /**
   * Get payment history via Redux
   */
  const getPaymentHistory = useCallback(
    async (params?: PaymentHistoryParams) => {
      try {
        const result = await dispatch(fetchPaymentHistory(params))
        if (result.payload) {
          return result.payload
        }
        throw new Error('Failed to get payment history')
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to get payment history'
        throw new Error(errorMessage)
      }
    },
    [dispatch]
  )

  /**
   * Get transactions via Redux
   */
  const getTransactions = useCallback(
    async (params?: TransactionListParams) => {
      try {
        const result = await dispatch(fetchTransactions(params))
        if (result.payload) {
          return result.payload
        }
        throw new Error('Failed to get transactions')
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to get transactions'
        throw new Error(errorMessage)
      }
    },
    [dispatch]
  )

  /**
   * Get single transaction via Redux
   */
  const getTransaction = useCallback(
    async (receiptNumber: string) => {
      try {
        const result = await dispatch(fetchTransaction(receiptNumber))
        if (result.payload) {
          return result.payload
        }
        throw new Error('Failed to get transaction')
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to get transaction'
        throw new Error(errorMessage)
      }
    },
    [dispatch]
  )

  /**
   * Retry failed payment (direct API call)
   */
  const retryPayment = useCallback(
    async (paymentId: number, data?: PaymentRetryRequest) => {
      setLocalLoading(true)
      setLocalError(null)
      try {
        const result = await mpesaAPI.retryPayment(paymentId, data || {})
        return result
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to retry payment'
        setLocalError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLocalLoading(false)
      }
    },
    []
  )

  /**
   * Reverse payment (direct API call)
   */
  const reversePayment = useCallback(
    async (receiptNumber: string, data: PaymentReversalRequest) => {
      setLocalLoading(true)
      setLocalError(null)
      try {
        const result = await mpesaAPI.reversePayment(receiptNumber, data)
        return result
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to reverse payment'
        setLocalError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLocalLoading(false)
      }
    },
    []
  )

  /**
   * Get payment summary via Redux
   */
  const getPaymentSummary = useCallback(
    async (days?: number) => {
      try {
        const result = await dispatch(fetchPaymentSummary(days))
        if (result.payload) {
          return result.payload
        }
        throw new Error('Failed to get payment summary')
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to get payment summary'
        throw new Error(errorMessage)
      }
    },
    [dispatch]
  )

  /**
   * Test webhook (direct API call, admin only)
   */
  const testWebhook = useCallback(
    async (type: 'stk_push' | 'c2b_validation', data?: any) => {
      setLocalLoading(true)
      setLocalError(null)
      try {
        const result = await mpesaAPI.testWebhook(type, data)
        return result
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to test webhook'
        setLocalError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLocalLoading(false)
      }
    },
    []
  )

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setLocalError(null)
    dispatch(clearPaymentError())
    dispatch(clearTransactionError())
  }, [dispatch])

  /**
   * Clear STK push state
   */
  const clearStkPushError = useCallback(() => {
    dispatch(clearSTKPushState())
  }, [dispatch])

  /**
   * Clear current payment state
   */
  const clearCurrentPaymentState = useCallback(() => {
    dispatch(clearCurrentPayment())
  }, [dispatch])

  /**
   * Clear current transaction state
   */
  const clearCurrentTransactionState = useCallback(() => {
    dispatch(clearCurrentTransaction())
  }, [dispatch])

  /**
   * Clear summary state
   */
  const clearSummaryState = useCallback(() => {
    dispatch(clearSummary())
  }, [dispatch])

  return {
    // Local state
    loading: localLoading,
    error: localError,

    // Redux state
    stkPush: stkPushState,
    payments: paymentsState,
    transactions: transactionsState,
    summary: summaryState,
    currentPayment: currentPaymentState,
    currentTransaction: currentTransactionState,

    // API methods
    initiatePayment,
    getPaymentStatus,
    getPaymentHistory,
    getTransactions,
    getTransaction,
    retryPayment,
    reversePayment,
    getPaymentSummary,
    testWebhook,

    // Clear methods
    clearErrors,
    clearStkPushError,
    clearCurrentPaymentState,
    clearCurrentTransactionState,
    clearSummaryState
  }
}

export default useMpesa