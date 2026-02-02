// frontend/src/hooks/useRepayments.js
import { useState, useCallback } from 'react'
import { repaymentsAPI } from '../api/repayments'
import { useToast } from '../contexts/ToastContext'

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

  const { showToast } = useToast()

  // ===== STATE MANAGEMENT =====

  const setLoading = (loading) => {
    setState(prev => ({ ...prev, loading }))
  }

  const setError = (error) => {
    setState(prev => ({ ...prev, error }))
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const clearSelectedRepayment = () => {
    setState(prev => ({ ...prev, selectedRepayment: null }))
  }

  const setPage = (page) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }))
  }

  const setPageSize = (pageSize) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, page: 1 }
    }))
  }

  // ===== REPAYMENT OPERATIONS =====

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
          next: response.next,
          previous: response.previous
        }
      }))
      
      return response
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch repayments'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [state.pagination.page, state.pagination.pageSize, showToast])

  const getRepaymentById = useCallback(async (id) => {
    try {
      setLoading(true)
      const repayment = await repaymentsAPI.getRepayment(id)
      
      setState(prev => ({
        ...prev,
        selectedRepayment: repayment
      }))
      
      return repayment
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch repayment'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const createRepayment = useCallback(async (data) => {
    try {
      setLoading(true)
      const repayment = await repaymentsAPI.createRepayment(data)
      
      // Add to local state if successful
      setState(prev => ({
        ...prev,
        repayments: [repayment, ...prev.repayments]
      }))
      
      showToast('Repayment created successfully', 'success')
      return repayment
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to create repayment'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const updateRepayment = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const repayment = await repaymentsAPI.updateRepayment(id, data)
      
      // Update in local state
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.map(r => 
          r.id === repayment.id ? repayment : r
        ),
        selectedRepayment: prev.selectedRepayment?.id === repayment.id ? repayment : prev.selectedRepayment
      }))
      
      showToast('Repayment updated successfully', 'success')
      return repayment
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to update repayment'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const deleteRepayment = useCallback(async (id) => {
    try {
      setLoading(true)
      await repaymentsAPI.deleteRepayment(id)
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.filter(r => r.id !== id),
        selectedRepayment: prev.selectedRepayment?.id === id ? null : prev.selectedRepayment
      }))
      
      showToast('Repayment deleted successfully', 'success')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to delete repayment'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const processRepayment = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const repayment = await repaymentsAPI.processRepayment(id, data)
      
      // Update in local state
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.map(r => 
          r.id === repayment.id ? repayment : r
        ),
        selectedRepayment: prev.selectedRepayment?.id === repayment.id ? repayment : prev.selectedRepayment
      }))
      
      showToast('Repayment processed successfully', 'success')
      return repayment
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to process repayment'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== SCHEDULE OPERATIONS =====

  const getSchedules = useCallback(async (loanId, params = {}) => {
    try {
      setLoading(true)
      const response = await repaymentsAPI.getSchedules(loanId, params)
      
      setState(prev => ({
        ...prev,
        schedules: response.results || []
      }))
      
      return response
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch schedules'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const generateSchedule = useCallback(async (loanId) => {
    try {
      setLoading(true)
      const schedules = await repaymentsAPI.generateSchedule(loanId)
      
      setState(prev => ({
        ...prev,
        schedules
      }))
      
      showToast('Schedule generated successfully', 'success')
      return schedules
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to generate schedule'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== PENALTY OPERATIONS =====

  const getPenalties = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const response = await repaymentsAPI.getPenalties(params)
      
      setState(prev => ({
        ...prev,
        penalties: response.results || []
      }))
      
      return response
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch penalties'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const createPenalty = useCallback(async (data) => {
    try {
      setLoading(true)
      const penalty = await repaymentsAPI.createPenalty(data)
      
      setState(prev => ({
        ...prev,
        penalties: [penalty, ...prev.penalties]
      }))
      
      showToast('Penalty created successfully', 'success')
      return penalty
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to create penalty'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== DASHBOARD & STATS =====

  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      const stats = await repaymentsAPI.getDashboard()
      
      setState(prev => ({
        ...prev,
        dashboardStats: stats
      }))
      
      return stats
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch dashboard stats'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const getStats = useCallback(async () => {
    try {
      setLoading(true)
      return await repaymentsAPI.getStats()
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch stats'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== SPECIAL VIEWS =====

  const getOverdueRepayments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const response = await repaymentsAPI.getOverdueRepayments(params)
      
      setState(prev => ({
        ...prev,
        repayments: response.results || []
      }))
      
      return response
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch overdue repayments'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const getUpcomingRepayments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const response = await repaymentsAPI.getUpcomingRepayments(params)
      
      setState(prev => ({
        ...prev,
        repayments: response.results || []
      }))
      
      return response
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch upcoming repayments'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== BULK OPERATIONS =====

  const bulkCreateRepayments = useCallback(async (data) => {
    try {
      setLoading(true)
      const result = await repaymentsAPI.bulkCreateRepayments(data)
      
      showToast(result.message, 'success')
      return result
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to bulk create repayments'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== EXPORT =====

  const exportRepayments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const blob = await repaymentsAPI.exportRepayments(params)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `repayments_export_${new Date().toISOString().split('T')[0]}.${
        params?.format === 'csv' ? 'csv' : 'xlsx'
      }`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      showToast('Repayments exported successfully', 'success')
      return blob
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to export repayments'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== CUSTOMER & LOAN SPECIFIC =====

  const getCustomerRepayments = useCallback(async (customerId, params = {}) => {
    try {
      setLoading(true)
      return await repaymentsAPI.getCustomerRepayments(customerId, params)
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch customer repayments'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const getLoanRepayments = useCallback(async (loanId, params = {}) => {
    try {
      setLoading(true)
      return await repaymentsAPI.getLoanRepayments(loanId, params)
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch loan repayments'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // ===== UTILITY FUNCTIONS =====

  const formatPaymentMethod = useCallback((method) => {
    return repaymentsAPI.formatPaymentMethod(method)
  }, [])

  const formatStatus = useCallback((status) => {
    return repaymentsAPI.formatStatus(status)
  }, [])

  const getStatusColor = useCallback((status) => {
    return repaymentsAPI.getStatusColor(status)
  }, [])

  const formatCurrency = useCallback((amount) => {
    return repaymentsAPI.formatCurrency(amount)
  }, [])

  const calculateRemainingDays = useCallback((dueDate) => {
    return repaymentsAPI.calculateRemainingDays(dueDate)
  }, [])

  return {
    // State
    ...state,
    
    // State setters
    setPage,
    setPageSize,
    clearError,
    clearSelectedRepayment,
    
    // Repayment operations
    getRepayments,
    getRepaymentById,
    createRepayment,
    updateRepayment,
    deleteRepayment,
    processRepayment,
    
    // Schedule operations
    getSchedules,
    generateSchedule,
    
    // Penalty operations
    getPenalties,
    createPenalty,
    
    // Dashboard & Stats
    getDashboardStats,
    getStats,
    
    // Special views
    getOverdueRepayments,
    getUpcomingRepayments,
    
    // Bulk operations
    bulkCreateRepayments,
    
    // Export
    exportRepayments,
    
    // Customer & Loan specific
    getCustomerRepayments,
    getLoanRepayments,
    
    // Utility functions
    formatPaymentMethod,
    formatStatus,
    getStatusColor,
    formatCurrency,
    calculateRemainingDays
  }
}

export default useRepayments