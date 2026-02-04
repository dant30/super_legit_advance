// frontend/src/hooks/useRepayments.js
import { useState, useCallback, useRef } from 'react'
import { useToast } from '../contexts/ToastContext'
import { repaymentsAPI } from '../api/repayments'

export const useRepayments = () => {
  const [state, setState] = useState({
    repayments: [],
    schedules: [],
    penalties: [],
    selectedRepayment: null,
    loading: false,
    error: null,
    dashboardStats: null,
    pagination: {
      count: 0,
      next: null,
      previous: null,
      page: 1,
      pageSize: 20,
    },
  })

  const { addToast } = useToast()
  const exportAbortRef = useRef(null)

  const setLoading = useCallback((loading) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const clearSelectedRepayment = useCallback(() => {
    setState(prev => ({ ...prev, selectedRepayment: null }))
  }, [])

  const setPage = useCallback((page) => {
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, page } }))
  }, [])

  const setPageSize = useCallback((pageSize) => {
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, pageSize, page: 1 } }))
  }, [])

  // ===== REPAYMENTS =====

  const getRepayments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const response = await repaymentsAPI.getRepayments({
        ...params,
        page: state.pagination.page,
        page_size: state.pagination.pageSize
      })
      setState(prev => ({
        ...prev,
        repayments: response.results || [],
        pagination: {
          ...prev.pagination,
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
        }
      }))
      return response
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch repayments'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [state.pagination.page, state.pagination.pageSize, addToast, setLoading])

  const getRepaymentById = useCallback(async (id) => {
    try {
      setLoading(true)
      const repayment = await repaymentsAPI.getRepayment(id)
      setState(prev => ({ ...prev, selectedRepayment: repayment }))
      return repayment
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch repayment'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast, setLoading])

  const createRepayment = useCallback(async (data) => {
    try {
      setLoading(true)
      const repayment = await repaymentsAPI.createRepayment(data)
      setState(prev => ({ ...prev, repayments: [repayment, ...prev.repayments] }))
      addToast({ title: 'Success', message: 'Repayment created', type: 'success' })
      return repayment
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create repayment'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const updateRepayment = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const repayment = await repaymentsAPI.updateRepayment(id, data)
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.map(r => r.id === repayment.id ? repayment : r),
        selectedRepayment: prev.selectedRepayment?.id === repayment.id ? repayment : prev.selectedRepayment
      }))
      addToast({ title: 'Success', message: 'Repayment updated', type: 'success' })
      return repayment
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update repayment'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const deleteRepayment = useCallback(async (id) => {
    try {
      setLoading(true)
      await repaymentsAPI.deleteRepayment(id)
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.filter(r => r.id !== id),
        selectedRepayment: prev.selectedRepayment?.id === id ? null : prev.selectedRepayment
      }))
      addToast({ title: 'Success', message: 'Repayment deleted', type: 'success' })
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to delete repayment'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const processRepayment = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.processRepayment(id, data)
      // update local state using returned repayment if provided
      const repayment = res.repayment || res
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.map(r => r.id === repayment.id ? repayment : r),
        selectedRepayment: prev.selectedRepayment?.id === repayment.id ? repayment : prev.selectedRepayment
      }))
      addToast({ title: 'Success', message: res.message || 'Repayment processed', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to process repayment'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const waiveRepayment = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.waiveRepayment(id, data)
      const repayment = res.repayment || res
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.map(r => r.id === repayment.id ? repayment : r),
        selectedRepayment: prev.selectedRepayment?.id === repayment.id ? repayment : prev.selectedRepayment
      }))
      addToast({ title: 'Success', message: res.message || 'Waiver applied', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to waive repayment'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const cancelRepayment = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.cancelRepayment(id, data)
      const repayment = res.repayment || res
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.map(r => r.id === repayment.id ? repayment : r),
        selectedRepayment: prev.selectedRepayment?.id === repayment.id ? repayment : prev.selectedRepayment
      }))
      addToast({ title: 'Success', message: res.message || 'Repayment cancelled', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to cancel repayment'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== SCHEDULES =====

  const getSchedules = useCallback(async (loanId, params = {}) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getSchedules(loanId, params)
      setState(prev => ({ ...prev, schedules: res.results || res || [] }))
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch schedules'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const generateSchedule = useCallback(async (loanId) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.generateSchedule(loanId)
      // replace local schedules with newly generated items
      setState(prev => ({ ...prev, schedules: res.schedule_items || res || [] }))
      addToast({ title: 'Success', message: res.message || 'Schedule generated', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to generate schedule'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const adjustSchedule = useCallback(async (scheduleId, data) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.adjustSchedule(scheduleId, data)
      addToast({ title: 'Success', message: res.message || 'Schedule adjusted', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to adjust schedule'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== PENALTIES =====

  const getPenalties = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getPenalties(params)
      setState(prev => ({ ...prev, penalties: res.results || res || [] }))
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch penalties'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const createPenalty = useCallback(async (data) => {
    try {
      setLoading(true)
      const penalty = await repaymentsAPI.createPenalty(data)
      setState(prev => ({ ...prev, penalties: [penalty, ...prev.penalties] }))
      addToast({ title: 'Success', message: 'Penalty created', type: 'success' })
      return penalty
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create penalty'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const applyPenalty = useCallback(async (id) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.applyPenalty(id)
      addToast({ title: 'Success', message: res.message || 'Penalty applied', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to apply penalty'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const waivePenalty = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.waivePenalty(id, data)
      addToast({ title: 'Success', message: res.message || 'Penalty waived', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to waive penalty'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== STATS & DASHBOARD =====

  const getStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getStats()
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch stats'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getDashboard()
      setState(prev => ({ ...prev, dashboardStats: res }))
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch dashboard'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== SPECIAL VIEWS =====

  const getOverdueRepayments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getOverdueRepayments(params)
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch overdue repayments'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const getUpcomingRepayments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getUpcomingRepayments(params)
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch upcoming repayments'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== BULK =====

  const bulkCreateRepayments = useCallback(async (data) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.bulkCreateRepayments(data)
      addToast({ title: 'Success', message: res.message || 'Bulk create completed', type: 'success' })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Bulk create failed'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== EXPORT =====

  const exportRepayments = useCallback(async (params = {}, filename = 'repayments_export.xlsx') => {
    try {
      setLoading(true)
      const blob = await repaymentsAPI.exportRepayments(params)
      repaymentsAPI.downloadExport(blob, filename)
      addToast({ title: 'Success', message: 'Export ready', type: 'success' })
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Export failed'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== CUSTOMER / LOAN SPECIFIC =====

  const getCustomerRepayments = useCallback(async (customerId, params = {}) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getCustomerRepayments(customerId, params)
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch customer repayments'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const getLoanRepayments = useCallback(async (loanId, params = {}) => {
    try {
      setLoading(true)
      const res = await repaymentsAPI.getLoanRepayments(loanId, params)
      return res
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch loan repayments'
      setError(msg)
      addToast({ title: 'Error', message: msg, type: 'error' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // ===== UTIL =====

  const formatStatus = useCallback((s) => repaymentsAPI.formatStatus(s), [])
  const formatCurrency = useCallback((a) => repaymentsAPI.formatCurrency(a), [])

  return {
    // state
    ...state,

    // setters
    setPage,
    setPageSize,
    clearError,
    clearSelectedRepayment,

    // repaid operations
    getRepayments,
    getRepaymentById,
    createRepayment,
    updateRepayment,
    deleteRepayment,
    processRepayment,
    waiveRepayment,
    cancelRepayment,

    // schedules
    getSchedules,
    generateSchedule,
    adjustSchedule,

    // penalties
    getPenalties,
    getPenalty: repaymentsAPI.getPenalty,
    createPenalty,
    applyPenalty,
    waivePenalty,

    // stats & dashboard
    getStats,
    getDashboardStats,

    // special
    getOverdueRepayments,
    getUpcomingRepayments,

    // bulk & export
    bulkCreateRepayments,
    exportRepayments,

    // customer/loan
    getCustomerRepayments,
    getLoanRepayments,

    // utils
    formatStatus,
    formatCurrency,
  }
}

export default useRepayments