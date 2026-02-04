// frontend/src/contexts/MpesaContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { mpesaAPI } from '../api/mpesa'

const MpesaContext = createContext(null)

const initialState = {
  payments: { data: null, loading: false, error: null, filters: {} },
  transactions: { data: null, loading: false, error: null, filters: {} },
  summary: { data: null, loading: false, error: null },
  currentPayment: { data: null, loading: false, error: null },
  currentTransaction: { data: null, loading: false, error: null },
  stkPush: { loading: false, error: null, success: false, checkoutRequestId: null, paymentReference: null, paymentId: null }
}

export const useMpesa = () => {
  const ctx = useContext(MpesaContext)
  if (!ctx) throw new Error('useMpesa must be used within MpesaProvider')
  return ctx
}

export const MpesaProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

  const setPartial = useCallback((patch) => setState(prev => ({ ...prev, ...patch })), [])

  const clearSTKPushState = useCallback(() => setPartial({ stkPush: initialState.stkPush }), [setPartial])
  const clearPaymentError = useCallback(() => setPartial({
    payments: { ...state.payments, error: null }, stkPush: { ...state.stkPush, error: null }
  }), [state.payments, state.stkPush, setPartial])
  const clearTransactionError = useCallback(() => setPartial({
    transactions: { ...state.transactions, error: null }, currentTransaction: { ...state.currentTransaction, error: null }
  }), [state.transactions, state.currentTransaction, setPartial])
  const clearCurrentPayment = useCallback(() => setPartial({ currentPayment: initialState.currentPayment }), [setPartial])
  const clearCurrentTransaction = useCallback(() => setPartial({ currentTransaction: initialState.currentTransaction }), [setPartial])
  const clearSummary = useCallback(() => setPartial({ summary: initialState.summary }), [setPartial])
  const clearAllErrors = useCallback(() => setPartial({
    payments: { ...state.payments, error: null },
    transactions: { ...state.transactions, error: null },
    summary: { ...state.summary, error: null },
    currentPayment: { ...state.currentPayment, error: null },
    currentTransaction: { ...state.currentTransaction, error: null },
    stkPush: { ...state.stkPush, error: null }
  }), [state, setPartial])

  // Initiate STK Push
  const initiatePayment = useCallback(async (payload) => {
    setPartial({ stkPush: { ...initialState.stkPush, loading: true } })
    try {
      const res = await mpesaAPI.initiateSTKPush(payload)
      // backend returns { success, payment_reference, checkout_request_id, payment_id }
      setPartial({
        stkPush: {
          loading: false,
          success: !!res?.success,
          error: res?.error || null,
          checkoutRequestId: res?.checkout_request_id || null,
          paymentReference: res?.payment_reference || null,
          paymentId: res?.payment_id || null
        }
      })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to initiate payment'
      setPartial({ stkPush: { ...initialState.stkPush, error: msg } })
      throw err
    }
  }, [setPartial])

  // Get payment status
  const getPaymentStatus = useCallback(async (paymentReference = null, checkoutRequestId = null) => {
    setPartial({ currentPayment: { ...initialState.currentPayment, loading: true } })
    try {
      const res = await mpesaAPI.getPaymentStatus(paymentReference, checkoutRequestId)
      // backend returns { success: true, payment: {...} } for PaymentStatusView
      const payment = res?.payment || res
      setPartial({ currentPayment: { data: payment, loading: false, error: null } })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to fetch payment status'
      setPartial({ currentPayment: { ...initialState.currentPayment, error: msg } })
      throw err
    }
  }, [setPartial])

  // Poll payment status
  const pollPaymentStatus = useCallback(async (checkoutRequestId, interval = 3000, maxAttempts = 20) => {
    setPartial({ currentPayment: { ...initialState.currentPayment, loading: true } })
    try {
      const res = await mpesaAPI.pollPaymentStatus(checkoutRequestId, interval, maxAttempts)
      const payment = res?.payment || res
      setPartial({ currentPayment: { data: payment, loading: false, error: null } })
      return res
    } catch (err) {
      const msg = err?.message || 'Failed to poll payment status'
      setPartial({ currentPayment: { ...state.currentPayment, loading: false, error: msg } })
      throw err
    }
  }, [state.currentPayment, setPartial])

  // Payment history
  const getPaymentHistory = useCallback(async (params = {}) => {
    setPartial({ payments: { ...state.payments, loading: true, error: null, filters: params } })
    try {
      const res = await mpesaAPI.getPaymentHistory(params)
      setPartial({ payments: { data: res, loading: false, error: null, filters: params } })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to fetch payment history'
      setPartial({ payments: { ...state.payments, loading: false, error: msg } })
      throw err
    }
  }, [state.payments, setPartial])

  // Transactions
  const getTransactions = useCallback(async (params = {}) => {
    setPartial({ transactions: { ...state.transactions, loading: true, error: null, filters: params } })
    try {
      const res = await mpesaAPI.getTransactions(params)
      setPartial({ transactions: { data: res, loading: false, error: null, filters: params } })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to fetch transactions'
      setPartial({ transactions: { ...state.transactions, loading: false, error: msg } })
      throw err
    }
  }, [state.transactions, setPartial])

  const getTransaction = useCallback(async (receiptNumber) => {
    setPartial({ currentTransaction: { ...initialState.currentTransaction, loading: true } })
    try {
      const res = await mpesaAPI.getTransaction(receiptNumber)
      setPartial({ currentTransaction: { data: res, loading: false, error: null } })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to fetch transaction'
      setPartial({ currentTransaction: { ...initialState.currentTransaction, error: msg } })
      throw err
    }
  }, [setPartial])

  // Retry & reverse
  const retryPayment = useCallback(async (paymentId, retryData = {}) => {
    try {
      const res = await mpesaAPI.retryPayment(paymentId, retryData)
      // refresh history with current filters
      await getPaymentHistory(state.payments.filters || {})
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to retry payment'
      throw new Error(msg)
    }
  }, [getPaymentHistory, state.payments.filters])

  const reversePayment = useCallback(async (receiptNumber, data = {}) => {
    try {
      const res = await mpesaAPI.reversePayment(receiptNumber, data)
      // refresh transactions
      await getTransactions(state.transactions.filters || {})
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to reverse payment'
      throw new Error(msg)
    }
  }, [getTransactions, state.transactions.filters])

  // Summary
  const getPaymentSummary = useCallback(async (days = 30) => {
    setPartial({ summary: { ...initialState.summary, loading: true } })
    try {
      const res = await mpesaAPI.getPaymentSummary(days)
      setPartial({ summary: { data: res, loading: false, error: null } })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to fetch summary'
      setPartial({ summary: { ...initialState.summary, error: msg } })
      throw err
    }
  }, [setPartial])

  const testWebhook = useCallback(async (type = 'stk_push', data = {}) => {
    return mpesaAPI.testWebhook(type, data)
  }, [])

  const exportPayments = useCallback(async (format = 'csv', params = {}) => {
    return mpesaAPI.exportPayments(format, params)
  }, [])

  const value = useMemo(() => ({
    ...state,
    // actions
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
    // clears
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

  return <MpesaContext.Provider value={value}>{children}</MpesaContext.Provider>
}

export default MpesaContext