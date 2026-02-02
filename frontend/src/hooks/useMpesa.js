// frontend/src/hooks/useMpesa.js
import { useContext } from 'react'
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
  const initiatePaymentWithPolling = async (paymentData, pollOptions = {}) => {
    try {
      // Clear previous state
      clearSTKPushState()
      
      // Initiate payment
      const result = await initiatePayment(paymentData)
      
      // Start polling if checkout request ID is available
      if (result.checkout_request_id) {
        const { interval = 3000, maxAttempts = 20 } = pollOptions
        await pollPaymentStatus(result.checkout_request_id, interval, maxAttempts)
      }
      
      return result
    } catch (error) {
      throw error
    }
  }

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
  const exportToFile = async (format = 'csv', params = {}) => {
    try {
      const blob = await exportPayments(format, params)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payments_export_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Load more payments (pagination)
   */
  const loadMorePayments = async () => {
    if (!payments.data?.next) return
    
    try {
      const url = new URL(payments.data.next)
      const params = Object.fromEntries(url.searchParams.entries())
      await getPaymentHistory(params)
    } catch (error) {
      throw error
    }
  }

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
  const refreshSummary = async (days) => {
    await getPaymentSummary(days)
  }

  return {
    summary,
    getPaymentSummary,
    refreshSummary,
    clearSummary
  }
}

export default useMpesa