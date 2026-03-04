// frontend/src/hooks/useMpesa.js
import { useContext, useCallback } from 'react'
import MpesaContext from '../contexts/MpesaContext'

/**
 * Custom hook for M-Pesa operations
 * Provides access to MpesaContext with proper error handling
 */
export const useMpesa = () => {
  const context = useContext(MpesaContext)
  
  if (!context) {
    throw new Error('useMpesa must be used within MpesaProvider')
  }
  
  return context
}

/**
 * Hook for initiating STK Push payments with auto-polling
 */
export const useMpesaPayment = () => {
  const {
    stkPush,
    initiatePayment,
    pollPaymentStatus,
    clearSTKPushState
  } = useMpesa()

  /**
   * Initiate payment and start polling
   */
  const initiatePaymentWithPolling = useCallback(async (paymentData, pollOptions = {}) => {
    // Clear previous state
    clearSTKPushState()
    
    // Initiate payment
    const res = await initiatePayment(paymentData)
    // backend returns { success, checkout_request_id, payment_id, ... }
    const checkoutId = res?.checkout_request_id || res?.data?.checkout_request_id
    if (checkoutId) {
      const { interval = 3000, maxAttempts = 20 } = pollOptions
      const final = await pollPaymentStatus(checkoutId, interval, maxAttempts)
      return { initiated: res, finalStatus: final }
    }
    return { initiated: res }
  }, [initiatePayment, pollPaymentStatus, clearSTKPushState])

  return {
    stkPush,
    initiatePayment: initiatePaymentWithPolling,
    clearSTKPushState
  }
}

/**
 * Hook for payment history operations
 */
export const useMpesaHistory = () => {
  const {
    payments,
    getPaymentHistory,
    clearPaymentError,
    exportPayments
  } = useMpesa()

  /**
   * Export payments to file
   */
  const exportToFile = useCallback(async (format = 'csv', params = {}) => {
    const blob = await exportPayments(format, params)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${new Date().toISOString().slice(0,10)}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    return true
  }, [exportPayments])

  /**
   * Load more payments (pagination)
   */
  const loadMorePayments = useCallback(async () => {
    if (!payments?.data?.next) return
    
    const url = new URL(payments.data.next)
    const params = Object.fromEntries(url.searchParams.entries())
    await getPaymentHistory(params)
  }, [payments, getPaymentHistory])

  return {
    payments,
    getPaymentHistory,
    clearPaymentError,
    exportToFile,
    loadMorePayments
  }
}

/**
 * Hook for transaction operations
 */
export const useMpesaTransactions = () => {
  const {
    transactions,
    currentTransaction,
    getTransactions,
    getTransaction,
    reversePayment,
    clearTransactionError,
    clearCurrentTransaction
  } = useMpesa()

  return {
    transactions,
    currentTransaction,
    getTransactions,
    getTransaction,
    reversePayment,
    clearTransactionError,
    clearCurrentTransaction
  }
}

/**
 * Hook for payment analytics
 */
export const useMpesaAnalytics = () => {
  const {
    summary,
    getPaymentSummary,
    clearSummary
  } = useMpesa()

  /**
   * Refresh summary data
   */
  const refreshSummary = useCallback(async (days = 30) => {
    await getPaymentSummary(days)
  }, [getPaymentSummary])

  return {
    summary,
    getPaymentSummary,
    refreshSummary,
    clearSummary
  }
}

export default useMpesa