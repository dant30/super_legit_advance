// frontend/src/hooks/useRepayments.ts
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect } from 'react'
import { 
  fetchRepayments, 
  fetchDashboardStats,
  clearError 
} from '@/store/slices/repaymentSlice'
import { RootState, AppDispatch } from '@/store/store'
import { repaymentsAPI } from '@/lib/api/repayments'
import type { 
  CreateRepaymentRequest, 
  ProcessRepaymentRequest,
  CreatePenaltyRequest
} from '@/lib/api/repayments'

export const useRepayments = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.repayments)

  // Redux actions
  const getRepayments = useCallback((params?: any) => {
    return dispatch(fetchRepayments(params))
  }, [dispatch])

  const getDashboardStats = useCallback(() => {
    return dispatch(fetchDashboardStats())
  }, [dispatch])

  // Direct API calls
  const getRepaymentById = useCallback(async (id: number) => {
    try {
      return await repaymentsAPI.getRepayment(id)
    } catch (error) {
      throw error
    }
  }, [])

  const createRepayment = useCallback(async (data: CreateRepaymentRequest) => {
    try {
      return await repaymentsAPI.createRepayment(data)
    } catch (error) {
      throw error
    }
  }, [])

  const processRepayment = useCallback(async (id: number, data: ProcessRepaymentRequest) => {
    try {
      return await repaymentsAPI.processRepayment(id, data)
    } catch (error) {
      throw error
    }
  }, [])

  const waiveRepayment = useCallback(async (id: number, data: { amount: number; reason: string }) => {
    try {
      return await repaymentsAPI.waiveRepayment(id, data)
    } catch (error) {
      throw error
    }
  }, [])

  const cancelRepayment = useCallback(async (id: number, data: { reason: string }) => {
    try {
      return await repaymentsAPI.cancelRepayment(id, data)
    } catch (error) {
      throw error
    }
  }, [])

  const getCustomerRepayments = useCallback(async (customerId: number, params?: any) => {
    try {
      return await repaymentsAPI.getCustomerRepayments(customerId, params)
    } catch (error) {
      throw error
    }
  }, [])

  const getLoanRepayments = useCallback(async (loanId: number, params?: any) => {
    try {
      return await repaymentsAPI.getLoanRepayments(loanId, params)
    } catch (error) {
      throw error
    }
  }, [])

  const getSchedules = useCallback(async (loanId: number, params?: any) => {
    try {
      return await repaymentsAPI.getSchedules(loanId, params)
    } catch (error) {
      throw error
    }
  }, [])

  const generateSchedule = useCallback(async (loanId: number) => {
    try {
      return await repaymentsAPI.generateSchedule(loanId)
    } catch (error) {
      throw error
    }
  }, [])

  const adjustSchedule = useCallback(async (scheduleId: number, data: any) => {
    try {
      return await repaymentsAPI.adjustSchedule(scheduleId, data)
    } catch (error) {
      throw error
    }
  }, [])

  const getPenalties = useCallback(async (params?: any) => {
    try {
      return await repaymentsAPI.getPenalties(params)
    } catch (error) {
      throw error
    }
  }, [])

  const createPenalty = useCallback(async (data: CreatePenaltyRequest) => {
    try {
      return await repaymentsAPI.createPenalty(data)
    } catch (error) {
      throw error
    }
  }, [])

  const applyPenalty = useCallback(async (id: number) => {
    try {
      return await repaymentsAPI.applyPenalty(id)
    } catch (error) {
      throw error
    }
  }, [])

  const waivePenalty = useCallback(async (id: number, data: { reason: string }) => {
    try {
      return await repaymentsAPI.waivePenalty(id, data)
    } catch (error) {
      throw error
    }
  }, [])

  const getOverdueRepayments = useCallback(async (params?: any) => {
    try {
      return await repaymentsAPI.getOverdueRepayments(params)
    } catch (error) {
      throw error
    }
  }, [])

  const getUpcomingRepayments = useCallback(async (params?: any) => {
    try {
      return await repaymentsAPI.getUpcomingRepayments(params)
    } catch (error) {
      throw error
    }
  }, [])

  const getStats = useCallback(async () => {
    try {
      return await repaymentsAPI.getStats()
    } catch (error) {
      throw error
    }
  }, [])

  const bulkCreateRepayments = useCallback(async (data: any) => {
    try {
      return await repaymentsAPI.bulkCreateRepayments(data)
    } catch (error) {
      throw error
    }
  }, [])

  const sendReminders = useCallback(async (data: any) => {
    try {
      return await repaymentsAPI.sendReminders(data)
    } catch (error) {
      throw error
    }
  }, [])

  const exportRepayments = useCallback(async (params?: any) => {
    try {
      return await repaymentsAPI.exportRepayments(params)
    } catch (error) {
      throw error
    }
  }, [])

  const searchRepayments = useCallback(async (params: any) => {
    try {
      return await repaymentsAPI.searchRepayments(params)
    } catch (error) {
      throw error
    }
  }, [])

  // Helper functions
  const clearRepaymentError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    repayments: state.repayments,
    schedules: state.schedules,
    selectedRepayment: state.selectedRepayment,
    loading: state.loading,
    error: state.error,
    dashboardStats: state.dashboardStats,
    
    // Redux actions
    getRepayments,
    getDashboardStats,
    clearRepaymentError,
    
    // Direct API calls
    getRepaymentById,
    createRepayment,
    processRepayment,
    waiveRepayment,
    cancelRepayment,
    getCustomerRepayments,
    getLoanRepayments,
    getSchedules,
    generateSchedule,
    adjustSchedule,
    getPenalties,
    createPenalty,
    applyPenalty,
    waivePenalty,
    getOverdueRepayments,
    getUpcomingRepayments,
    getStats,
    bulkCreateRepayments,
    sendReminders,
    exportRepayments,
    searchRepayments,
  }
}