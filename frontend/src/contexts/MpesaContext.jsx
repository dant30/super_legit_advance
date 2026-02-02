// frontend/src/contexts/MpesaContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { mpesaAPI } from '../api/mpesa'

// Create context
const MpesaContext = createContext()

// Initial state
const initialState = {
  payments: {
    data: null,
    loading: false,
    error: null,
    filters: {}
  },
  transactions: {
    data: null,
    loading: false,
    error: null,
    filters: {}
  },
  summary: {
    data: null,
    loading: false,
    error: null
  },
  currentPayment: {
    data: null,
    loading: false,
    error: null
  },
  currentTransaction: {
    data: null,
    loading: false,
    error: null
  },
  stkPush: {
    loading: false,
    error: null,
    success: false,
    checkoutRequestId: null,
    paymentReference: null,
    paymentId: null
  }
}

export const useMpesa = () => {
  const context = useContext(MpesaContext)
  if (!context) {
    throw new Error('useMpesa must be used within MpesaProvider')
  }
  return context
}

export const MpesaProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

  // Helper to update state
  const setMpesaState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Clear state functions
  const clearSTKPushState = useCallback(() => {
    setMpesaState({ stkPush: initialState.stkPush })
  }, [setMpesaState])

  const clearPaymentError = useCallback(() => {
    setMpesaState({ 
      payments: { ...state.payments, error: null },
      stkPush: { ...state.stkPush, error: null }
    })
  }, [state.payments, state.stkPush, setMpesaState])

  const clearTransactionError = useCallback(() => {
    setMpesaState({ 
      transactions: { ...state.transactions, error: null },
      currentTransaction: { ...state.currentTransaction, error: null }
    })
  }, [state.transactions, state.currentTransaction, setMpesaState])

  const clearCurrentPayment = useCallback(() => {
    setMpesaState({ currentPayment: initialState.currentPayment })
  }, [setMpesaState])

  const clearCurrentTransaction = useCallback(() => {
    setMpesaState({ currentTransaction: initialState.currentTransaction })
  }, [setMpesaState])

  const clearSummary = useCallback(() => {
    setMpesaState({ summary: initialState.summary })
  }, [setMpesaState])

  const clearAllErrors = useCallback(() => {
    setMpesaState({
      payments: { ...state.payments, error: null },
      transactions: { ...state.transactions, error: null },
      summary: { ...state.summary, error: null },
      currentPayment: { ...state.currentPayment, error: null },
      currentTransaction: { ...state.currentTransaction, error: null },
      stkPush: { ...state.stkPush, error: null }
    })
  }, [state, setMpesaState])

  // STK Push Payment
  const initiatePayment = useCallback(async (paymentData) => {
    setMpesaState({ 
      stkPush: { ...initialState.stkPush, loading: true }
    })

    try {
      const result = await mpesaAPI.initiateSTKPush(paymentData)
      
      setMpesaState({
        stkPush: {
          loading: false,
          success: true,
          error: null,
          checkoutRequestId: result.checkout_request_id,
          paymentReference: result.payment_reference,
          paymentId: result.payment_id
        }
      })

      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to initiate payment'
      
      setMpesaState({
        stkPush: {
          ...initialState.stkPush,
          error: errorMessage
        }
      })

      throw new Error(errorMessage)
    }
  }, [setMpesaState])

  // Get Payment Status
  const getPaymentStatus = useCallback(async (paymentReference, checkoutRequestId) => {
    setMpesaState({ 
      currentPayment: { ...initialState.currentPayment, loading: true }
    })

    try {
      const result = await mpesaAPI.getPaymentStatus(paymentReference, checkoutRequestId)
      
      setMpesaState({
        currentPayment: {
          data: result.payment,
          loading: false,
          error: null
        }
      })

      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get payment status'
      
      setMpesaState({
        currentPayment: {
          ...initialState.currentPayment,
          error: errorMessage
        }
      })

      throw new Error(errorMessage)
    }
  }, [setMpesaState])

  // Poll Payment Status
  const pollPaymentStatus = useCallback(async (checkoutRequestId, interval = 3000, maxAttempts = 20) => {
    try {
      const result = await mpesaAPI.pollPaymentStatus(checkoutRequestId, interval, maxAttempts)
      
      setMpesaState({
        currentPayment: {
          data: result.payment,
          loading: false,
          error: null
        }
      })

      return result
    } catch (error) {
      const errorMessage = error.message || 'Failed to poll payment status'
      
      setMpesaState({
        currentPayment: {
          ...state.currentPayment,
          loading: false,
          error: errorMessage
        }
      })

      throw new Error(errorMessage)
    }
  }, [state.currentPayment, setMpesaState])

  // Get Payment History
  const getPaymentHistory = useCallback(async (params = {}) => {
    setMpesaState({ 
      payments: { 
        ...state.payments, 
        loading: true, 
        error: null,
        filters: params 
      }
    })

    try {
      const result = await mpesaAPI.getPaymentHistory(params)
      
      setMpesaState({
        payments: {
          data: result,
          loading: false,
          error: null,
          filters: params
        }
      })

      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch payment history'
      
      setMpesaState({
        payments: {
          ...state.payments,
          loading: false,
          error: errorMessage
        }
      })

      throw new Error(errorMessage)
    }
  }, [state.payments, setMpesaState])

  // Get Transactions
  const getTransactions = useCallback(async (params = {}) => {
    setMpesaState({ 
      transactions: { 
        ...state.transactions, 
        loading: true, 
        error: null,
        filters: params 
      }
    })

    try {
      const result = await mpesaAPI.getTransactions(params)
      
      setMpesaState({
        transactions: {
          data: result,
          loading: false,
          error: null,
          filters: params
        }
      })

      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch transactions'
      
      setMpesaState({
        transactions: {
          ...state.transactions,
          loading: false,
          error: errorMessage
        }
      })

      throw new Error(errorMessage)
    }
  }, [state.transactions, setMpesaState])

  // Get Single Transaction
  const getTransaction = useCallback(async (receiptNumber) => {
    setMpesaState({ 
      currentTransaction: { ...initialState.currentTransaction, loading: true }
    })

    try {
      const result = await mpesaAPI.getTransaction(receiptNumber)
      
      setMpesaState({
        currentTransaction: {
          data: result,
          loading: false,
          error: null
        }
      })

      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch transaction'
      
      setMpesaState({
        currentTransaction: {
          ...initialState.currentTransaction,
          error: errorMessage
        }
      })

      throw new Error(errorMessage)
    }
  }, [setMpesaState])

  // Retry Payment
  const retryPayment = useCallback(async (paymentId, retryData = {}) => {
    try {
      const result = await mpesaAPI.retryPayment(paymentId, retryData)
      
      // Refresh payment history
      await getPaymentHistory(state.payments.filters)
      
      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to retry payment'
      throw new Error(errorMessage)
    }
  }, [state.payments.filters, getPaymentHistory])

  // Reverse Payment
  const reversePayment = useCallback(async (receiptNumber, reversalData) => {
    try {
      const result = await mpesaAPI.reversePayment(receiptNumber, reversalData)
      
      // Refresh transaction list
      await getTransactions(state.transactions.filters)
      
      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to reverse payment'
      throw new Error(errorMessage)
    }
  }, [state.transactions.filters, getTransactions])

  // Get Payment Summary
  const getPaymentSummary = useCallback(async (days) => {
    setMpesaState({ 
      summary: { ...initialState.summary, loading: true }
    })

    try {
      const result = await mpesaAPI.getPaymentSummary(days)
      
      setMpesaState({
        summary: {
          data: result,
          loading: false,
          error: null
        }
      })

      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch payment summary'
      
      setMpesaState({
        summary: {
          ...initialState.summary,
          error: errorMessage
        }
      })

      throw new Error(errorMessage)
    }
  }, [setMpesaState])

  // Test Webhook
  const testWebhook = useCallback(async (type, data) => {
    try {
      const result = await mpesaAPI.testWebhook(type, data)
      return result
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to test webhook'
      throw new Error(errorMessage)
    }
  }, [])

  // Export Payments
  const exportPayments = useCallback(async (format, params) => {
    try {
      const blob = await mpesaAPI.exportPayments(format, params)
      return blob
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to export payments'
      throw new Error(errorMessage)
    }
  }, [])

  // Value to provide
  const value = useMemo(() => ({
    // State
    ...state,
    
    // Actions
    initiatePayment,
    getPaymentStatus,
    pollPaymentStatus,
    getPaymentHistory,
    getTransactions,
    getTransaction,
    retryPayment,
    reversePayment,
    getPaymentSummary,
    testWebhook,
    exportPayments,
    
    // Clear actions
    clearSTKPushState,
    clearPaymentError,
    clearTransactionError,
    clearCurrentPayment,
    clearCurrentTransaction,
    clearSummary,
    clearAllErrors
  }), [
    state,
    initiatePayment,
    getPaymentStatus,
    pollPaymentStatus,
    getPaymentHistory,
    getTransactions,
    getTransaction,
    retryPayment,
    reversePayment,
    getPaymentSummary,
    testWebhook,
    exportPayments,
    clearSTKPushState,
    clearPaymentError,
    clearTransactionError,
    clearCurrentPayment,
    clearCurrentTransaction,
    clearSummary,
    clearAllErrors
  ])

  return (
    <MpesaContext.Provider value={value}>
      {children}
    </MpesaContext.Provider>
  )
}

export default MpesaContext