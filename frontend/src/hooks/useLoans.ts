// frontend/src/hooks/useLoans.ts
// frontend/src/hooks/useLoans.ts
import { useState, useCallback } from 'react'
import { loansAPI, Loan, LoanApplication, Collateral, LoanStats, LoanCalculatorResponse } from '@/lib/api/loans'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  fetchLoans as fetchLoansAction, 
  fetchLoanById as fetchLoanByIdAction,
  createLoan as createLoanAction,
  updateLoan as updateLoanAction,
  approveLoan as approveLoanAction,
  rejectLoan as rejectLoanAction,
  disburseLoan as disburseLoanAction,
  setFilters,
  setPage,
  clearSelectedLoan,
  clearError
} from '@/store/slices/loanSlice'

export const useLoans = () => {
  const dispatch = useAppDispatch()
  const { loans, selectedLoan, isLoading, error, filters, pagination } = useAppSelector(state => state.loans)
  
  const [loanStats, setLoanStats] = useState<LoanStats | null>(null)
  const [calculatorResult, setCalculatorResult] = useState<LoanCalculatorResponse | null>(null)
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null)
  const [collaterals, setCollaterals] = useState<Collateral[]>([])
  const [selectedCollateral, setSelectedCollateral] = useState<Collateral | null>(null)

  // Loan management
  const getLoans = useCallback(async (params?: any) => {
    return dispatch(fetchLoansAction(params))
  }, [dispatch])

  const getLoan = useCallback(async (id: number) => {
    return dispatch(fetchLoanByIdAction(id.toString()))
  }, [dispatch])

  const createNewLoan = useCallback(async (data: any) => {
    return dispatch(createLoanAction(data))
  }, [dispatch])

  const updateExistingLoan = useCallback(async (id: number, data: any) => {
    return dispatch(updateLoanAction({ id: id.toString(), data }))
  }, [dispatch])

  const approveExistingLoan = useCallback(async (id: number, data?: any) => {
    return dispatch(approveLoanAction({ id: id.toString(), data }))
  }, [dispatch])

  const rejectExistingLoan = useCallback(async (id: number, reason: string) => {
    return dispatch(rejectLoanAction({ id: id.toString(), reason }))
  }, [dispatch])

  const disburseExistingLoan = useCallback(async (id: number, data?: any) => {
    return dispatch(disburseLoanAction({ id: id.toString(), data }))
  }, [dispatch])

  const calculateLoan = useCallback(async (data: any) => {
    try {
      const result = await loansAPI.calculateLoan(data)
      setCalculatorResult(result)
      return result
    } catch (error) {
      throw error
    }
  }, [])

  const getStatistics = useCallback(async () => {
    try {
      const stats = await loansAPI.getLoanStats()
      setLoanStats(stats)
      return stats
    } catch (error) {
      throw error
    }
  }, [])

  const exportLoans = useCallback(async (format: 'excel' | 'csv', filters?: any) => {
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
  }, [])

  // Loan Application management
  const getLoanApplications = useCallback(async (params?: any) => {
    try {
      const response = await loansAPI.getLoanApplications(params)
      setApplications(response.results)
      return response
    } catch (error) {
      throw error
    }
  }, [])

  const getLoanApplication = useCallback(async (id: number) => {
    try {
      const application = await loansAPI.getLoanApplication(id)
      setSelectedApplication(application)
      return application
    } catch (error) {
      throw error
    }
  }, [])

  const createLoanApplication = useCallback(async (data: any) => {
    try {
      const application = await loansAPI.createLoanApplication(data)
      return application
    } catch (error) {
      throw error
    }
  }, [])

  const updateLoanApplication = useCallback(async (id: number, data: any) => {
    try {
      const application = await loansAPI.updateLoanApplication(id, data)
      if (selectedApplication?.id === id) {
        setSelectedApplication(application)
      }
      return application
    } catch (error) {
      throw error
    }
  }, [selectedApplication])

  const submitLoanApplication = useCallback(async (id: number) => {
    try {
      const application = await loansAPI.submitLoanApplication(id)
      if (selectedApplication?.id === id) {
        setSelectedApplication(application)
      }
      return application
    } catch (error) {
      throw error
    }
  }, [selectedApplication])

  const reviewLoanApplication = useCallback(async (id: number, data: any) => {
    try {
      const application = await loansAPI.reviewLoanApplication(id, data)
      if (selectedApplication?.id === id) {
        setSelectedApplication(application)
      }
      return application
    } catch (error) {
      throw error
    }
  }, [selectedApplication])

  const approveLoanApplication = useCallback(async (id: number, data?: any) => {
    try {
      const application = await loansAPI.approveLoanApplication(id, data)
      if (selectedApplication?.id === id) {
        setSelectedApplication(application)
      }
      return application
    } catch (error) {
      throw error
    }
  }, [selectedApplication])

  const rejectLoanApplication = useCallback(async (id: number, reason: string) => {
    try {
      const application = await loansAPI.rejectLoanApplication(id, { rejection_reason: reason })
      if (selectedApplication?.id === id) {
        setSelectedApplication(application)
      }
      return application
    } catch (error) {
      throw error
    }
  }, [selectedApplication])

  // Collateral management
  const getCollaterals = useCallback(async (loanId: number, params?: any) => {
    try {
      const response = await loansAPI.getCollaterals(loanId, params)
      setCollaterals(response.results)
      return response
    } catch (error) {
      throw error
    }
  }, [])

  const getCollateral = useCallback(async (id: number) => {
    try {
      const collateral = await loansAPI.getCollateral(id)
      setSelectedCollateral(collateral)
      return collateral
    } catch (error) {
      throw error
    }
  }, [])

  const createCollateral = useCallback(async (loanId: number, data: any) => {
    try {
      const collateral = await loansAPI.createCollateral(loanId, data)
      return collateral
    } catch (error) {
      throw error
    }
  }, [])

  const updateCollateral = useCallback(async (id: number, data: any) => {
    try {
      const collateral = await loansAPI.updateCollateral(id, data)
      if (selectedCollateral?.id === id) {
        setSelectedCollateral(collateral)
      }
      return collateral
    } catch (error) {
      throw error
    }
  }, [selectedCollateral])

  const releaseCollateral = useCallback(async (id: number, data?: any) => {
    try {
      const collateral = await loansAPI.releaseCollateral(id, data)
      if (selectedCollateral?.id === id) {
        setSelectedCollateral(collateral)
      }
      return collateral
    } catch (error) {
      throw error
    }
  }, [selectedCollateral])

  // Utility functions
  const updateFilters = useCallback((newFilters: any) => {
    dispatch(setFilters(newFilters))
  }, [dispatch])

  const updatePage = useCallback((page: number) => {
    dispatch(setPage(page))
  }, [dispatch])

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedLoan())
    setSelectedApplication(null)
    setSelectedCollateral(null)
  }, [dispatch])

  const clearErrors = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    loans,
    selectedLoan,
    isLoading,
    error,
    filters,
    pagination,
    loanStats,
    calculatorResult,
    applications,
    selectedApplication,
    collaterals,
    selectedCollateral,

    // Loan actions
    getLoans,
    getLoan,
    createLoan: createNewLoan,
    updateLoan: updateExistingLoan,
    approveLoan: approveExistingLoan,
    rejectLoan: rejectExistingLoan,
    disburseLoan: disburseExistingLoan,
    calculateLoan,
    getStatistics,
    exportLoans,

    // Loan Application actions
    getLoanApplications,
    getLoanApplication,
    createLoanApplication,
    updateLoanApplication,
    submitLoanApplication,
    reviewLoanApplication,
    approveLoanApplication,
    rejectLoanApplication,

    // Collateral actions
    getCollaterals,
    getCollateral,
    createCollateral,
    updateCollateral,
    releaseCollateral,

    // Utility actions
    updateFilters,
    updatePage,
    clearSelected,
    clearErrors,
  }
}