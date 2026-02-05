// frontend/src/hooks/useLoans.js
import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loanAPI, LOAN_STATUS } from '@api/loans'
import { useToast } from '@contexts/ToastContext'

export const useLoans = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [loanFilters, setLoanFilters] = useState({})
  const [applicationFilters, setApplicationFilters] = useState({})

  // ---------- Queries ----------
  const useLoansQuery = (overrides = {}) =>
    useQuery({
      queryKey: ['loans', { ...loanFilters, ...overrides }],
      queryFn: () => loanAPI.getLoans({ ...loanFilters, ...overrides }),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      onError: (err) => {
        toast.error(err?.response?.data?.detail || 'Failed to fetch loans', { title: 'Error' })
      }
    })

  const useLoanQuery = (id) =>
    useQuery({
      queryKey: ['loan', id],
      queryFn: () => loanAPI.getLoan(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10,
      onError: (err) => {
        toast.error(err?.response?.data?.detail || 'Failed to fetch loan', { title: 'Error' })
      }
    })

  const useLoanStatsQuery = () =>
    useQuery({
      queryKey: ['loanStats'],
      queryFn: () => loanAPI.getLoanStats(),
      staleTime: 1000 * 60 * 2,
      onError: () => toast.error('Failed to fetch loan stats', { title: 'Error' })
    })

  const useLoanApplicationsQuery = (overrides = {}) =>
    useQuery({
      queryKey: ['loanApplications', { ...applicationFilters, ...overrides }],
      queryFn: () => loanAPI.getLoanApplications({ ...applicationFilters, ...overrides }),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      onError: (err) => toast.error(err?.response?.data?.detail || 'Failed to fetch applications', { title: 'Error' })
    })

  const useLoanApplicationQuery = (id) =>
    useQuery({
      queryKey: ['loanApplication', id],
      queryFn: () => loanAPI.getLoanApplication(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10,
      onError: (err) => toast.error(err?.response?.data?.detail || 'Failed to fetch application', { title: 'Error' })
    })

  // ---------- Mutations ----------
  const useCreateLoan = () =>
    useMutation({
      mutationFn: (data) => loanAPI.createLoan(data),
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        toast.success('Loan created', { title: 'Success' })
        return res
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to create loan', { title: 'Error' })
        throw err
      }
    })

  const useUpdateLoan = () =>
    useMutation({
      mutationFn: ({ id, data }) => loanAPI.updateLoan(id, data),
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        queryClient.invalidateQueries({ queryKey: ['loan', vars.id] })
        toast.success('Loan updated', { title: 'Success' })
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to update loan', { title: 'Error' })
        throw err
      }
    })

  const useDeleteLoan = () =>
    useMutation({
      mutationFn: (id) => loanAPI.deleteLoan(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        toast.success('Loan deleted', { title: 'Success' })
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to delete loan', { title: 'Error' })
        throw err
      }
    })

  const useApproveLoan = () =>
    useMutation({
      mutationFn: ({ id, data }) => loanAPI.approveLoan(id, data),
      onSuccess: (res, vars) => {
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        queryClient.invalidateQueries({ queryKey: ['loan', vars.id] })
        toast.success(res?.message || 'Loan approved', { title: 'Success' })
        return res
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to approve loan', { title: 'Error' })
        throw err
      }
    })

  const useRejectLoan = () =>
    useMutation({
      mutationFn: ({ id, reason }) => loanAPI.rejectLoan(id, reason),
      onSuccess: (res, vars) => {
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        queryClient.invalidateQueries({ queryKey: ['loan', vars.id] })
        toast.info(res?.message || 'Loan rejected', { title: 'Success' })
        return res
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to reject loan', { title: 'Error' })
        throw err
      }
    })

  const useDisburseLoan = () =>
    useMutation({
      mutationFn: ({ id, data }) => loanAPI.disburseLoan(id, data),
      onSuccess: (res, vars) => {
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        queryClient.invalidateQueries({ queryKey: ['loan', vars.id] })
        toast.success(res?.message || 'Loan disbursed', { title: 'Success' })
        return res
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to disburse loan', { title: 'Error' })
        throw err
      }
    })

  const useCalculateLoan = () =>
    useMutation({
      mutationFn: (payload) => loanAPI.calculateLoan(payload),
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to calculate loan', { title: 'Error' })
        throw err
      }
    })

  // Applications mutations
  const useCreateLoanApplication = () =>
    useMutation({
      mutationFn: (data) => loanAPI.createLoanApplication(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['loanApplications'] })
        toast.success('Application created', { title: 'Success' })
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to create application', { title: 'Error' })
        throw err
      }
    })

  const useSubmitLoanApplication = () =>
    useMutation({
      mutationFn: (id) => loanAPI.submitLoanApplication(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['loanApplications'] })
        queryClient.invalidateQueries({ queryKey: ['loanApplication', id] })
        toast.success('Application submitted', { title: 'Success' })
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to submit application', { title: 'Error' })
        throw err
      }
    })

  const useApproveLoanApplication = () =>
    useMutation({
      mutationFn: ({ id, data }) => loanAPI.approveLoanApplication(id, data),
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ['loanApplications'] })
        queryClient.invalidateQueries({ queryKey: ['loans'] })
        toast.success(res?.message || 'Application approved', { title: 'Success' })
        return res
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to approve application', { title: 'Error' })
        throw err
      }
    })

  const useRejectLoanApplication = () =>
    useMutation({
      mutationFn: ({ id, reason }) => loanAPI.rejectLoanApplication(id, reason),
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ['loanApplications'] })
        toast.info(res?.message || 'Application rejected', { title: 'Success' })
        return res
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to reject application', { title: 'Error' })
        throw err
      }
    })

  // Collateral
  const useCollateralsQuery = (loanId, filters = {}) =>
    useQuery({
      queryKey: ['collaterals', loanId, filters],
      queryFn: () => loanAPI.getCollaterals(loanId, filters),
      enabled: !!loanId,
      onError: (err) => toast.error(err?.response?.data?.detail || 'Failed to fetch collateral', { title: 'Error' })
    })

  const useCreateCollateral = () =>
    useMutation({
      mutationFn: ({ loanId, data }) => loanAPI.createCollateral(loanId, data),
      onSuccess: () => {
        toast.success('Collateral created', { title: 'Success' })
        queryClient.invalidateQueries({ queryKey: ['collaterals'] })
      },
      onError: (err) => {
        toast.error(err?.response?.data || 'Failed to create collateral', { title: 'Error' })
        throw err
      }
    })

  // Utilities
  const exportLoans = useCallback(
    async (format = 'excel', filters = {}) => {
      try {
        const blob = await loanAPI.exportLoans(format, filters)
        const ext = format === 'csv' ? 'csv' : 'xlsx'
        loanAPI.downloadExport(blob, `loans_export.${ext}`)
        toast.success('Export started', { title: 'Export' })
      } catch (err) {
        toast.error(err?.response?.data || 'Failed to export loans', { title: 'Error' })
        throw err
      }
    },
    [toast]
  )

  const searchLoans = useCallback(
    async (query, type = 'basic', params = {}) => {
      try {
        return await loanAPI.searchLoans(query, type, params)
      } catch (err) {
        toast.error(err?.response?.data || 'Failed to search loans', { title: 'Error' })
        throw err
      }
    },
    [toast]
  )

  // Filters
  const updateLoanFilters = useCallback((filters) => setLoanFilters((p) => ({ ...p, ...filters })), [])
  const updateApplicationFilters = useCallback((filters) => setApplicationFilters((p) => ({ ...p, ...filters })), [])
  const clearLoanFilters = useCallback(() => setLoanFilters({}), [])
  const clearApplicationFilters = useCallback(() => setApplicationFilters({}), [])

  return {
    // constants
    LOAN_STATUS,

    // state
    loanFilters,
    applicationFilters,

    // queries
    useLoansQuery,
    useLoanQuery,
    useLoanStatsQuery,
    useLoanApplicationsQuery,
    useLoanApplicationQuery,
    useCollateralsQuery,

    // mutations
    useCreateLoan,
    useUpdateLoan,
    useDeleteLoan,
    useApproveLoan,
    useRejectLoan,
    useDisburseLoan,
    useCalculateLoan,

    useCreateLoanApplication,
    useSubmitLoanApplication,
    useApproveLoanApplication,
    useRejectLoanApplication,

    useCreateCollateral,

    // utilities
    exportLoans,
    searchLoans,
    updateLoanFilters,
    updateApplicationFilters,
    clearLoanFilters,
    clearApplicationFilters,

    // validation helpers (delegates to loanAPI)
    validateLoanData: loanAPI.validateLoanData,
    calculateAffordability: loanAPI.calculateAffordability
  }
}

/**
 * Hook for loan-related utilities without React Query
 */
export const useLoanUtils = () => {
  const toast = useToast()

  const calculateRepaymentProgress = (loan) => {
    if (!loan || !loan.amount_approved || !loan.outstanding_balance) return 0
    const amountPaid = loan.amount_approved - loan.outstanding_balance
    return (amountPaid / loan.amount_approved) * 100
  }

  const getLoanAge = (loan) => {
    if (!loan || !loan.created_at) return 0
    const created = new Date(loan.created_at)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getNextPaymentDate = (loan) => {
    if (!loan || !loan.next_payment_date) return null
    return new Date(loan.next_payment_date)
  }

  const isLoanOverdue = (loan) => {
    if (!loan || !loan.next_payment_date) return false
    const nextPayment = new Date(loan.next_payment_date)
    const today = new Date()
    return loan.status === LOAN_STATUS.ACTIVE && nextPayment < today
  }

  const calculateTotalInterest = (loan) => {
    if (!loan || !loan.amount_approved || !loan.interest_rate || !loan.term_months) return 0
    const monthlyRate = loan.interest_rate / 100 / 12
    const totalInterest = loan.amount_approved * monthlyRate * loan.term_months
    return totalInterest
  }

  const getLoanStatusColor = (status) => {
    const colorMap = {
      [LOAN_STATUS.PENDING]: 'yellow',
      [LOAN_STATUS.APPROVED]: 'blue',
      [LOAN_STATUS.ACTIVE]: 'green',
      [LOAN_STATUS.COMPLETED]: 'gray',
      [LOAN_STATUS.REJECTED]: 'red',
      [LOAN_STATUS.DEFAULTED]: 'red'
    }
    return colorMap[status] || 'gray'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return {
    calculateRepaymentProgress,
    getLoanAge,
    getNextPaymentDate,
    isLoanOverdue,
    calculateTotalInterest,
    getLoanStatusColor,
    formatCurrency
  }
}

export default useLoans
