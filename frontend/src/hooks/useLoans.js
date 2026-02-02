// frontend/src/hooks/useLoans.ts
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import {
  fetchLoans,
  fetchLoanById,
  createLoan,
  updateLoan,
  approveLoan,
  rejectLoan,
  disburseLoan,
  fetchLoanStats,
  fetchLoanApplications,
  fetchLoanApplicationById,
  createLoanApplication,
  updateLoanApplication,
  submitLoanApplication,
  reviewLoanApplication,
  approveLoanApplication,
  rejectLoanApplication,
  fetchCollaterals,
  fetchCollateralById,
  createCollateral,
  updateCollateral,
  releaseCollateral,
  clearLoansError,
  clearApplicationsError,
  clearCollateralsError,
  clearStatsError,
  clearSelectedLoan,
  clearSelectedApplication,
  clearSelectedCollateral,
  setLoanFilters,
  setApplicationFilters,
  setLoanPage,
  setApplicationPage,
} from '@/store/slices/loanSlice'
import { loansAPI } from '@/lib/api/loans'

export const useLoans = () => {
  const dispatch = useDispatch<AppDispatch>()

  const {
    loans,
    selectedLoan,
    loansLoading,
    loansError,
    loanFilters,
    loanPagination,
    applications,
    selectedApplication,
    applicationsLoading,
    applicationsError,
    applicationFilters,
    applicationPagination,
    collaterals,
    selectedCollateral,
    collateralsLoading,
    collateralsError,
    stats,
    statsLoading,
    statsError,
  } = useSelector((state: RootState) => state.loans)

  /* ========== LOAN MANAGEMENT ========== */

  const getLoans = useCallback(
    (params?: any) => {
      return dispatch(
        fetchLoans({
          ...loanFilters,
          ...params,
          page: loanPagination.page,
          page_size: loanPagination.page_size,
        })
      )
    },
    [dispatch, loanFilters, loanPagination]
  )

  const getLoan = useCallback(
    (id: number | string) => {
      return dispatch(fetchLoanById(id))
    },
    [dispatch]
  )

  const createNewLoan = useCallback(
    (data: any) => {
      return dispatch(createLoan(data))
    },
    [dispatch]
  )

  const updateExistingLoan = useCallback(
    (id: number, data: any) => {
      return dispatch(updateLoan({ id, data }))
    },
    [dispatch]
  )

  const approveExistingLoan = useCallback(
    (id: number, data?: any) => {
      return dispatch(approveLoan({ id, data }))
    },
    [dispatch]
  )

  const rejectExistingLoan = useCallback(
    (id: number, reason: string) => {
      return dispatch(rejectLoan({ id, reason }))
    },
    [dispatch]
  )

  const disburseExistingLoan = useCallback(
    (id: number, data?: any) => {
      return dispatch(disburseLoan({ id, data }))
    },
    [dispatch]
  )

  const calculateLoanTerms = useCallback(
    async (data: any) => {
      try {
        return await loansAPI.calculateLoan(data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  const getStatistics = useCallback(() => {
    return dispatch(fetchLoanStats({}))  // ✅ Pass empty object
  }, [dispatch])

  const exportLoans = useCallback(
    async (format: 'excel' | 'csv', filters?: any) => {
      try {
        const blob = await loansAPI.exportLoans(format, filters)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `loans_export.${format === 'excel' ? 'xlsx' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return true
      } catch (error) {
        throw error
      }
    },
    []
  )

  /* ========== LOAN APPLICATION MANAGEMENT ========== */

  const getLoanApplications = useCallback(
    (params?: any) => {
      return dispatch(
        fetchLoanApplications({
          ...applicationFilters,
          ...params,
          page: applicationPagination.page,
          page_size: applicationPagination.page_size,
        })
      )
    },
    [dispatch, applicationFilters, applicationPagination]
  )

  const getLoanApplication = useCallback(
    (id: number) => {
      return dispatch(fetchLoanApplicationById(id))
    },
    [dispatch]
  )

  const createNewLoanApplication = useCallback(
    (data: any) => {
      return dispatch(createLoanApplication(data))
    },
    [dispatch]
  )

  const updateExistingLoanApplication = useCallback(
    (id: number, data: any) => {
      return dispatch(updateLoanApplication({ id, data }))
    },
    [dispatch]
  )

  const submitExistingLoanApplication = useCallback(
    (id: number) => {
      return dispatch(submitLoanApplication(id))
    },
    [dispatch]
  )

  const reviewExistingLoanApplication = useCallback(
    (id: number, data: any) => {
      return dispatch(reviewLoanApplication({ id, data }))
    },
    [dispatch]
  )

  const approveExistingLoanApplication = useCallback(
    (id: number, data?: any) => {
      return dispatch(approveLoanApplication({ id, data }))
    },
    [dispatch]
  )

  const rejectExistingLoanApplication = useCallback(
    (id: number, reason: string) => {
      return dispatch(rejectLoanApplication({ id, reason }))
    },
    [dispatch]
  )

  /* ========== COLLATERAL MANAGEMENT ========== */

  const getCollaterals = useCallback(
    (loanId: number, params?: any) => {
      return dispatch(fetchCollaterals({ loanId, params }))
    },
    [dispatch]
  )

  const getCollateral = useCallback(
    (id: number) => {
      return dispatch(fetchCollateralById(id))
    },
    [dispatch]
  )

  const createNewCollateral = useCallback(
    (loanId: number, data: any) => {
      return dispatch(createCollateral({ loanId, data }))
    },
    [dispatch]
  )

  const updateExistingCollateral = useCallback(
    (id: number, data: any) => {
      return dispatch(updateCollateral({ id, data }))
    },
    [dispatch]
  )

  const releaseExistingCollateral = useCallback(
    (id: number, data?: any) => {
      return dispatch(releaseCollateral({ id, data }))
    },
    [dispatch]
  )

  /* ========== FILTER & PAGINATION ========== */

  const updateLoanFilters = useCallback(
    (filters: any) => {
      dispatch(setLoanFilters(filters))
    },
    [dispatch]
  )

  const updateApplicationFilters = useCallback(
    (filters: any) => {
      dispatch(setApplicationFilters(filters))
    },
    [dispatch]
  )

  const changeLoanPage = useCallback(
    (page: number) => {
      dispatch(setLoanPage(page))
    },
    [dispatch]
  )

  const changeApplicationPage = useCallback(
    (page: number) => {
      dispatch(setApplicationPage(page))
    },
    [dispatch]
  )

  /* ========== ERROR CLEARING ========== */

  const clearLoanError = useCallback(() => {
    dispatch(clearLoansError())
  }, [dispatch])

  const clearApplicationError = useCallback(() => {
    dispatch(clearApplicationsError())
  }, [dispatch])

  const clearCollateralError = useCallback(() => {
    dispatch(clearCollateralsError())
  }, [dispatch])

  const clearStatError = useCallback(() => {
    dispatch(clearStatsError())
  }, [dispatch])

  const clearLoanSelection = useCallback(() => {
    dispatch(clearSelectedLoan())
  }, [dispatch])

  const clearApplicationSelection = useCallback(() => {
    dispatch(clearSelectedApplication())
  }, [dispatch])

  const clearCollateralSelection = useCallback(() => {
    dispatch(clearSelectedCollateral())
  }, [dispatch])

  return {
    // Loan state
    loans,
    selectedLoan,
    loansLoading,
    loansError,
    loanFilters,
    loanPagination,

    // Loan actions
    getLoans,
    getLoan,
    createNewLoan,
    updateExistingLoan,
    approveExistingLoan,
    rejectExistingLoan,
    disburseExistingLoan,
    calculateLoanTerms,
    getStatistics,
    exportLoans,

    // Application state
    applications,
    selectedApplication,
    applicationsLoading,
    applicationsError,
    applicationFilters,
    applicationPagination,

    // Application actions
    getLoanApplications,
    getLoanApplication,
    createNewLoanApplication,
    updateExistingLoanApplication,
    submitExistingLoanApplication,
    reviewExistingLoanApplication,
    approveExistingLoanApplication,
    rejectExistingLoanApplication,

    // Collateral state
    collaterals,
    selectedCollateral,
    collateralsLoading,
    collateralsError,

    // Collateral actions
    getCollaterals,
    getCollateral,
    createNewCollateral,
    updateExistingCollateral,
    releaseExistingCollateral,

    // Statistics state
    stats,
    statsLoading,
    statsError,

    // Filter & pagination
    updateLoanFilters,
    updateApplicationFilters,
    changeLoanPage,
    changeApplicationPage,

    // Error clearing
    clearLoanError,
    clearApplicationError,
    clearCollateralError,
    clearStatError,

    // Selection clearing
    clearLoanSelection,
    clearApplicationSelection,
    clearCollateralSelection,
  }
}