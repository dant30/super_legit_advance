// frontend/src/hooks/useLoans.js
import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loanAPI, LOAN_STATUS } from '@api/loans'
import { useToast } from '@contexts/ToastContext'
import { LOAN_DEFAULT_FILTERS, LOAN_SEARCH_TYPE } from '../types'
import { useDispatch } from 'react-redux'
import {
  setApplicationFilters as setApplicationFiltersAction,
  setCollaterals,
  setLoanApplications,
  setLoanCalculatorResult,
  setLoanFilters as setLoanFiltersAction,
  setLoanSearchResults,
  setLoanStats,
  setLoans,
  setLoansLoading,
  setSelectedLoan,
  setSelectedLoanApplication,
  setLoansState,
} from '../store'

const normalizeLoanErrorMessage = (error, fallback = 'Request failed') => {
  if (!error) return fallback
  if (typeof error === 'string') return error

  const payload = error?.response?.data ?? error
  if (typeof payload === 'string') return payload
  if (!payload || typeof payload !== 'object') return error?.message || fallback

  if (typeof payload.detail === 'string') return payload.detail
  if (typeof payload.message === 'string') return payload.message
  if (typeof payload.error === 'string') return payload.error

  if (payload.error && typeof payload.error === 'object') {
    if (typeof payload.error.detail === 'string') return payload.error.detail
    if (typeof payload.error.message === 'string') return payload.error.message
  }

  const firstEntry = Object.entries(payload).find(([, value]) => {
    if (typeof value === 'string') return true
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return true
    return false
  })

  if (firstEntry) {
    const [, value] = firstEntry
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value[0]
  }

  return error?.message || fallback
}

export const useLoans = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const dispatch = useDispatch()
  const [loanFilters, setLoanFilters] = useState(LOAN_DEFAULT_FILTERS)
  const [applicationFilters, setApplicationFilters] = useState({})

  // ---------- Queries ----------
  const useLoansQuery = (overrides = {}) => {
    const query = useQuery({
      queryKey: ['loans', { ...loanFilters, ...overrides }],
      queryFn: () => loanAPI.getLoans({ ...loanFilters, ...overrides }),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      onError: (err) => {
        toast.error(normalizeLoanErrorMessage(err, 'Failed to fetch loans'), { title: 'Error' })
      }
    })

    useEffect(() => {
      dispatch(setLoansLoading(query.isLoading))
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.error) {
        dispatch(
          setLoansState({
            loansError: normalizeLoanErrorMessage(query.error, 'Failed to fetch loans'),
          })
        )
        return
      }

      const data = query.data
      if (!data) return
      dispatch(setLoans(Array.isArray(data) ? data : data?.results || []))
      dispatch(
        setLoansState({
          loansError: null,
          loansPagination: {
            page: data?.page ?? 1,
            page_size: data?.page_size ?? data?.results?.length ?? 0,
            total: data?.count ?? data?.total ?? 0,
            total_pages: data?.total_pages ?? 0,
          },
        })
      )
    }, [dispatch, query.data, query.error])

    return query
  }

  const useLoanQuery = (id) => {
    const query = useQuery({
      queryKey: ['loan', id],
      queryFn: () => loanAPI.getLoan(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10,
      onError: (err) => {
        toast.error(normalizeLoanErrorMessage(err, 'Failed to fetch loan'), { title: 'Error' })
      }
    })

    useEffect(() => {
      dispatch(
        setLoansState({
          selectedLoanLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.error) {
        dispatch(
          setLoansState({
            selectedLoanError: normalizeLoanErrorMessage(query.error, 'Failed to fetch loan'),
          })
        )
        return
      }

      if (query.data) {
        dispatch(setSelectedLoan(query.data))
        dispatch(
          setLoansState({
            selectedLoanError: null,
          })
        )
      }
    }, [dispatch, query.data, query.error])

    return query
  }

  const useLoanStatsQuery = () => {
    const query = useQuery({
      queryKey: ['loanStats'],
      queryFn: () => loanAPI.getLoanStats(),
      staleTime: 1000 * 60 * 2,
      onError: (err) => toast.error(normalizeLoanErrorMessage(err, 'Failed to fetch loan stats'), { title: 'Error' })
    })

    useEffect(() => {
      dispatch(
        setLoansState({
          statsLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.error) {
        dispatch(
          setLoansState({
            statsError: normalizeLoanErrorMessage(query.error, 'Failed to fetch loan stats'),
          })
        )
        return
      }

      if (query.data) {
        dispatch(setLoanStats(query.data))
        dispatch(
          setLoansState({
            statsError: null,
          })
        )
      }
    }, [dispatch, query.data, query.error])

    return query
  }

  const useLoanApplicationsQuery = (overrides = {}) => {
    const query = useQuery({
      queryKey: ['loanApplications', { ...applicationFilters, ...overrides }],
      queryFn: () => loanAPI.getLoanApplications({ ...applicationFilters, ...overrides }),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      onError: (err) =>
        toast.error(normalizeLoanErrorMessage(err, 'Failed to fetch applications'), { title: 'Error' })
    })

    useEffect(() => {
      dispatch(
        setLoansState({
          loanApplicationsLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.error) {
        dispatch(
          setLoansState({
            loanApplicationsError: normalizeLoanErrorMessage(query.error, 'Failed to fetch applications'),
          })
        )
        return
      }

      const data = query.data
      if (!data) return
      dispatch(setLoanApplications(Array.isArray(data) ? data : data?.results || []))
      dispatch(
        setLoansState({
          loanApplicationsError: null,
        })
      )
    }, [dispatch, query.data, query.error])

    return query
  }

  const useLoanApplicationQuery = (id) => {
    const query = useQuery({
      queryKey: ['loanApplication', id],
      queryFn: () => loanAPI.getLoanApplication(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10,
      onError: (err) =>
        toast.error(normalizeLoanErrorMessage(err, 'Failed to fetch application'), { title: 'Error' })
    })

    useEffect(() => {
      if (query.data) {
        dispatch(setSelectedLoanApplication(query.data))
      }
    }, [dispatch, query.data])

    return query
  }

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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to create loan'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to update loan'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to delete loan'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to approve loan'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to reject loan'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to disburse loan'), { title: 'Error' })
        throw err
      }
    })

  const useCalculateLoan = () =>
    useMutation({
      mutationFn: (payload) => loanAPI.calculateLoan(payload),
      onMutate: () => {
        dispatch(
          setLoansState({
            calculatorLoading: true,
            calculatorError: null,
          })
        )
      },
      onSuccess: (result) => {
        dispatch(setLoanCalculatorResult(result))
        dispatch(
          setLoansState({
            calculatorLoading: false,
            calculatorError: null,
          })
        )
      },
      onError: (err) => {
        dispatch(
          setLoansState({
            calculatorLoading: false,
            calculatorError: normalizeLoanErrorMessage(err, 'Failed to calculate loan'),
          })
        )
        toast.error(normalizeLoanErrorMessage(err, 'Failed to calculate loan'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to create application'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to submit application'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to approve application'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to reject application'), { title: 'Error' })
        throw err
      }
    })

  // Collateral
  const useCollateralsQuery = (loanId, filters = {}) => {
    const query = useQuery({
      queryKey: ['collaterals', loanId, filters],
      queryFn: () => loanAPI.getCollaterals(loanId, filters),
      enabled: !!loanId,
      onError: (err) =>
        toast.error(normalizeLoanErrorMessage(err, 'Failed to fetch collateral'), { title: 'Error' })
    })

    useEffect(() => {
      dispatch(
        setLoansState({
          collateralsLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.error) {
        dispatch(
          setLoansState({
            collateralsError: normalizeLoanErrorMessage(query.error, 'Failed to fetch collateral'),
          })
        )
        return
      }

      const data = query.data
      if (!data) return
      dispatch(setCollaterals(Array.isArray(data) ? data : data?.results || []))
      dispatch(
        setLoansState({
          collateralsError: null,
        })
      )
    }, [dispatch, query.data, query.error])

    return query
  }

  const useCreateCollateral = () =>
    useMutation({
      mutationFn: ({ loanId, data }) => loanAPI.createCollateral(loanId, data),
      onSuccess: () => {
        toast.success('Collateral created', { title: 'Success' })
        queryClient.invalidateQueries({ queryKey: ['collaterals'] })
      },
      onError: (err) => {
        toast.error(normalizeLoanErrorMessage(err, 'Failed to create collateral'), { title: 'Error' })
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
        toast.error(normalizeLoanErrorMessage(err, 'Failed to export loans'), { title: 'Error' })
        throw err
      }
    },
    [toast]
  )

  const searchLoans = useCallback(
    async (query, type = 'basic', params = {}) => {
      try {
        dispatch(
          setLoansState({
            searchLoading: true,
            searchError: null,
          })
        )
        const results = await loanAPI.searchLoans(query, type, params)
        const normalized = Array.isArray(results) ? results : results?.results || []
        dispatch(setLoanSearchResults(normalized))
        dispatch(
          setLoansState({
            searchLoading: false,
            searchError: null,
          })
        )
        return normalized
      } catch (err) {
        dispatch(
          setLoansState({
            searchLoading: false,
            searchError: normalizeLoanErrorMessage(err, 'Failed to search loans'),
          })
        )
        toast.error(normalizeLoanErrorMessage(err, 'Failed to search loans'), { title: 'Error' })
        throw err
      }
    },
    [dispatch, toast]
  )

  // Filters
  const updateLoanFilters = useCallback((filters) => {
    setLoanFilters((p) => {
      const next = { ...p, ...filters }
      dispatch(setLoanFiltersAction(next))
      return next
    })
  }, [dispatch])

  const updateApplicationFilters = useCallback((filters) => {
    setApplicationFilters((p) => {
      const next = { ...p, ...filters }
      dispatch(setApplicationFiltersAction(next))
      return next
    })
  }, [dispatch])

  const clearLoanFilters = useCallback(() => {
    setLoanFilters(LOAN_DEFAULT_FILTERS)
    dispatch(setLoanFiltersAction(LOAN_DEFAULT_FILTERS))
  }, [dispatch])

  const clearApplicationFilters = useCallback(() => {
    setApplicationFilters({})
    dispatch(setApplicationFiltersAction({}))
  }, [dispatch])

  return {
    // constants
    LOAN_STATUS,
    LOAN_SEARCH_TYPE,

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
