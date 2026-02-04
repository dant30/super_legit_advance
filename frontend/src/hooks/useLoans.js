// frontend/src/hooks/useLoans.js
import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loanAPI, LOAN_STATUS } from '@api/loans'
import { useToast } from '@contexts/ToastContext'

export const useLoans = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
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
        showToast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to fetch loans', status: 'error' })
      }
    })

  const useLoanQuery = (id) =>
    useQuery({
      queryKey: ['loan', id],
      queryFn: () => loanAPI.getLoan(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10,
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to fetch loan', status: 'error' })
      }
    })

  const useLoanStatsQuery = () =>
    useQuery({
      queryKey: ['loanStats'],
      queryFn: () => loanAPI.getLoanStats(),
      staleTime: 1000 * 60 * 2,
      onError: () => showToast({ title: 'Error', description: 'Failed to fetch loan stats', status: 'error' })
    })

  const useLoanApplicationsQuery = (overrides = {}) =>
    useQuery({
      queryKey: ['loanApplications', { ...applicationFilters, ...overrides }],
      queryFn: () => loanAPI.getLoanApplications({ ...applicationFilters, ...overrides }),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      onError: (err) => showToast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to fetch applications', status: 'error' })
    })

  const useLoanApplicationQuery = (id) =>
    useQuery({
      queryKey: ['loanApplication', id],
      queryFn: () => loanAPI.getLoanApplication(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10,
      onError: (err) => showToast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to fetch application', status: 'error' })
    })

  // ---------- Mutations ----------
  const useCreateLoan = () =>
    useMutation((data) => loanAPI.createLoan(data), {
      onSuccess: (res) => {
        queryClient.invalidateQueries(['loans'])
        showToast({ title: 'Success', description: 'Loan created', status: 'success' })
        return res
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to create loan', status: 'error' })
        throw err
      }
    })

  const useUpdateLoan = () =>
    useMutation(({ id, data }) => loanAPI.updateLoan(id, data), {
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries(['loans'])
        queryClient.invalidateQueries(['loan', vars.id])
        showToast({ title: 'Success', description: 'Loan updated', status: 'success' })
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to update loan', status: 'error' })
        throw err
      }
    })

  const useDeleteLoan = () =>
    useMutation((id) => loanAPI.deleteLoan(id), {
      onSuccess: () => {
        queryClient.invalidateQueries(['loans'])
        showToast({ title: 'Success', description: 'Loan deleted', status: 'success' })
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to delete loan', status: 'error' })
        throw err
      }
    })

  const useApproveLoan = () =>
    useMutation(({ id, data }) => loanAPI.approveLoan(id, data), {
      onSuccess: (res, vars) => {
        queryClient.invalidateQueries(['loans'])
        queryClient.invalidateQueries(['loan', vars.id])
        showToast({ title: 'Success', description: res?.message || 'Loan approved', status: 'success' })
        return res
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to approve loan', status: 'error' })
        throw err
      }
    })

  const useRejectLoan = () =>
    useMutation(({ id, reason }) => loanAPI.rejectLoan(id, reason), {
      onSuccess: (res, vars) => {
        queryClient.invalidateQueries(['loans'])
        queryClient.invalidateQueries(['loan', vars.id])
        showToast({ title: 'Success', description: res?.message || 'Loan rejected', status: 'info' })
        return res
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to reject loan', status: 'error' })
        throw err
      }
    })

  const useDisburseLoan = () =>
    useMutation(({ id, data }) => loanAPI.disburseLoan(id, data), {
      onSuccess: (res, vars) => {
        queryClient.invalidateQueries(['loans'])
        queryClient.invalidateQueries(['loan', vars.id])
        showToast({ title: 'Success', description: res?.message || 'Loan disbursed', status: 'success' })
        return res
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to disburse loan', status: 'error' })
        throw err
      }
    })

  const useCalculateLoan = () =>
    useMutation((payload) => loanAPI.calculateLoan(payload), {
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to calculate loan', status: 'error' })
        throw err
      }
    })

  // Applications mutations
  const useCreateLoanApplication = () =>
    useMutation((data) => loanAPI.createLoanApplication(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(['loanApplications'])
        showToast({ title: 'Success', description: 'Application created', status: 'success' })
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to create application', status: 'error' })
        throw err
      }
    })

  const useSubmitLoanApplication = () =>
    useMutation((id) => loanAPI.submitLoanApplication(id), {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(['loanApplications'])
        queryClient.invalidateQueries(['loanApplication', id])
        showToast({ title: 'Success', description: 'Application submitted', status: 'success' })
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to submit application', status: 'error' })
        throw err
      }
    })

  const useApproveLoanApplication = () =>
    useMutation(({ id, data }) => loanAPI.approveLoanApplication(id, data), {
      onSuccess: (res) => {
        queryClient.invalidateQueries(['loanApplications'])
        queryClient.invalidateQueries(['loans'])
        showToast({ title: 'Success', description: res?.message || 'Application approved', status: 'success' })
        return res
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to approve application', status: 'error' })
        throw err
      }
    })

  const useRejectLoanApplication = () =>
    useMutation(({ id, reason }) => loanAPI.rejectLoanApplication(id, reason), {
      onSuccess: (res) => {
        queryClient.invalidateQueries(['loanApplications'])
        showToast({ title: 'Success', description: res?.message || 'Application rejected', status: 'info' })
        return res
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to reject application', status: 'error' })
        throw err
      }
    })

  // Collateral
  const useCollateralsQuery = (loanId, filters = {}) =>
    useQuery({
      queryKey: ['collaterals', loanId, filters],
      queryFn: () => loanAPI.getCollaterals(loanId, filters),
      enabled: !!loanId,
      onError: (err) => showToast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to fetch collateral', status: 'error' })
    })

  const useCreateCollateral = () =>
    useMutation(({ loanId, data }) => loanAPI.createCollateral(loanId, data), {
      onSuccess: () => {
        showToast({ title: 'Success', description: 'Collateral created', status: 'success' })
        queryClient.invalidateQueries(['collaterals'])
      },
      onError: (err) => {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to create collateral', status: 'error' })
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
        showToast({ title: 'Export', description: 'Export started', status: 'success' })
      } catch (err) {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to export loans', status: 'error' })
        throw err
      }
    },
    [showToast]
  )

  const searchLoans = useCallback(
    async (query, type = 'basic', params = {}) => {
      try {
        return await loanAPI.searchLoans(query, type, params)
      } catch (err) {
        showToast({ title: 'Error', description: err?.response?.data || 'Failed to search loans', status: 'error' })
        throw err
      }
    },
    [showToast]
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
  const { showToast } = useToast()

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