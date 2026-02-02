// frontend/src/hooks/useRepayments.ts
import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import {
  fetchRepayments,
  fetchRepayment,
  fetchSchedules,
  fetchPenalties,
  fetchDashboardStats,
  fetchOverdueRepayments,
  fetchUpcomingRepayments,
  clearError,
  clearSelectedRepayment,
} from '@/store/slices/repaymentSlice'
import { RootState, AppDispatch } from '@/store/store'
import { repaymentsAPI } from '@/lib/api/repayments'
import type {
  CreateRepaymentRequest,
  ProcessRepaymentRequest,
  CreatePenaltyRequest,
  AdjustScheduleRequest,
  BulkRepaymentRequest,
  SendRemindersRequest,
} from '@/lib/api/repayments'

export const useRepayments = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.repayments)

  /* ---- REDUX THUNKS ---- */

  const getRepayments = useCallback(
    (params?: any) => dispatch(fetchRepayments(params)),
    [dispatch]
  )

  const getRepaymentById = useCallback(
    (id: number) => dispatch(fetchRepayment(id)),
    [dispatch]
  )

  const getSchedules = useCallback(
    (loanId: number, params?: any) =>
      dispatch(fetchSchedules({ loanId, params })),
    [dispatch]
  )

  const getPenalties = useCallback(
    (params?: any) => dispatch(fetchPenalties(params)),
    [dispatch]
  )

  const getDashboardStats = useCallback(
    () => dispatch(fetchDashboardStats()),
    [dispatch]
  )

  const getOverdueRepayments = useCallback(
    (params?: any) => dispatch(fetchOverdueRepayments(params)),
    [dispatch]
  )

  const getUpcomingRepayments = useCallback(
    (params?: any) => dispatch(fetchUpcomingRepayments(params)),
    [dispatch]
  )

  /* ---- DIRECT API CALLS - REPAYMENTS ---- */

  const createRepayment = useCallback(async (data: CreateRepaymentRequest) => {
    try {
      return await repaymentsAPI.createRepayment(data)
    } catch (error) {
      throw error
    }
  }, [])

  const updateRepayment = useCallback(async (id: number, data: any) => {
    try {
      return await repaymentsAPI.updateRepayment(id, data)
    } catch (error) {
      throw error
    }
  }, [])

  const deleteRepayment = useCallback(async (id: number) => {
    try {
      return await repaymentsAPI.deleteRepayment(id)
    } catch (error) {
      throw error
    }
  }, [])

  const processRepayment = useCallback(
    async (id: number, data: ProcessRepaymentRequest) => {
      try {
        return await repaymentsAPI.processRepayment(id, data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  const waiveRepayment = useCallback(
    async (id: number, data: { amount: number; reason: string }) => {
      try {
        return await repaymentsAPI.waiveRepayment(id, data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  const cancelRepayment = useCallback(
    async (id: number, data: { reason: string }) => {
      try {
        return await repaymentsAPI.cancelRepayment(id, data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  /* ---- DIRECT API CALLS - CUSTOMER & LOAN REPAYMENTS ---- */

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

  /* ---- DIRECT API CALLS - SCHEDULES ---- */

  const generateSchedule = useCallback(async (loanId: number) => {
    try {
      return await repaymentsAPI.generateSchedule(loanId)
    } catch (error) {
      throw error
    }
  }, [])

  const adjustSchedule = useCallback(
    async (scheduleId: number, data: AdjustScheduleRequest) => {
      try {
        return await repaymentsAPI.adjustSchedule(scheduleId, data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  /* ---- DIRECT API CALLS - PENALTIES ---- */

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

  const waivePenalty = useCallback(
    async (id: number, data: { reason: string }) => {
      try {
        return await repaymentsAPI.waivePenalty(id, data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  /* ---- BULK OPERATIONS ---- */

  const bulkCreateRepayments = useCallback(async (data: BulkRepaymentRequest) => {
    try {
      return await repaymentsAPI.bulkCreateRepayments(data)
    } catch (error) {
      throw error
    }
  }, [])

  const sendReminders = useCallback(async (data: SendRemindersRequest) => {
    try {
      return await repaymentsAPI.sendReminders(data)
    } catch (error) {
      throw error
    }
  }, [])

  /* ---- EXPORT & SEARCH ---- */

  const exportRepayments = useCallback(async (params?: any) => {
    try {
      const blob = await repaymentsAPI.exportRepayments(params)
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `repayments_${new Date().toISOString().split('T')[0]}.${
        params?.format === 'csv' ? 'csv' : 'xlsx'
      }`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return blob
    } catch (error) {
      throw error
    }
  }, [])

  const searchRepayments = useCallback(
    async (params: { q: string; type?: string }) => {
      try {
        return await repaymentsAPI.searchRepayments(params as any)
      } catch (error) {
        throw error
      }
    },
    []
  )

  const getStats = useCallback(async () => {
    try {
      return await repaymentsAPI.getStats()
    } catch (error) {
      throw error
    }
  }, [])

  /* ---- HELPER FUNCTIONS ---- */

  const clearRepaymentError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const clearSelectedRepaymentData = useCallback(() => {
    dispatch(clearSelectedRepayment())
  }, [dispatch])

  return {
    // State
    repayments: state.repayments,
    schedules: state.schedules,
    penalties: state.penalties,
    selectedRepayment: state.selectedRepayment,
    loading: state.loading,
    error: state.error,
    dashboardStats: state.dashboardStats,
    pagination: state.pagination,

    // Redux actions
    getRepayments,
    getRepaymentById,
    getSchedules,
    getPenalties,
    getDashboardStats,
    getOverdueRepayments,
    getUpcomingRepayments,

    // Direct API - Repayments
    createRepayment,
    updateRepayment,
    deleteRepayment,
    processRepayment,
    waiveRepayment,
    cancelRepayment,

    // Direct API - Customer/Loan Repayments
    getCustomerRepayments,
    getLoanRepayments,

    // Direct API - Schedules
    generateSchedule,
    adjustSchedule,

    // Direct API - Penalties
    createPenalty,
    applyPenalty,
    waivePenalty,

    // Bulk operations
    bulkCreateRepayments,
    sendReminders,

    // Export & Search
    exportRepayments,
    searchRepayments,
    getStats,

    // Helpers
    clearRepaymentError,
    clearSelectedRepaymentData,
  }
}