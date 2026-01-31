// frontend/src/hooks/useCustomers.ts
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import {
  fetchCustomers as fetchCustomersAction,
  fetchCustomerById as fetchCustomerByIdAction,
  createCustomer as createCustomerAction,
  updateCustomer as updateCustomerAction,
  deleteCustomer as deleteCustomerAction,
  searchCustomers as searchCustomersAction,
  fetchCustomerStats as fetchCustomerStatsAction,
  blacklistCustomer as blacklistCustomerAction,
  activateCustomer as activateCustomerAction,
  fetchEmployment as fetchEmploymentAction,
  updateEmployment as updateEmploymentAction,
  fetchGuarantors as fetchGuarantorsAction,
  createGuarantor as createGuarantorAction,
  fetchGuarantorById as fetchGuarantorByIdAction,
  updateGuarantor as updateGuarantorAction,
  deleteGuarantor as deleteGuarantorAction,
  verifyGuarantor as verifyGuarantorAction,
  clearCustomersError,
  clearSelectedCustomerError,
  clearStatsError,
  clearEmploymentError,
  clearGuarantorsError,
  clearSearchError,
  clearSelectedCustomer,
  clearSelectedGuarantor,
  setFilters,
  setCustomerPage,
} from '@/store/slices/customerSlice'
import { customerAPI } from '@/lib/api/customers'
import type {
  Customer,
  CustomerDetailResponse,
  CustomerListResponse,
  CustomerStatsResponse,
  CustomerListParams,
  CustomerCreateData,
  CustomerUpdateData,
  Employment,
  EmploymentCreateData,
  Guarantor,
  GuarantorCreateData,
} from '@/lib/api/customers'

interface UseCustomersReturn {
  // State
  customers: Customer[]
  customersLoading: boolean
  customersError: string | null
  customersPagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
  
  selectedCustomer: CustomerDetailResponse | null
  selectedCustomerLoading: boolean
  selectedCustomerError: string | null
  
  stats: CustomerStatsResponse | null
  statsLoading: boolean
  statsError: string | null
  
  employment: Employment | null
  employmentLoading: boolean
  employmentError: string | null
  
  guarantors: Guarantor[]
  selectedGuarantor: Guarantor | null
  guarantorsLoading: boolean
  guarantorsError: string | null
  
  searchResults: Customer[]
  searchLoading: boolean
  searchError: string | null
  
  filters: {
    search?: string
    status?: string
    gender?: string
    county?: string
    risk_level?: string
  }

  // Customer methods
  fetchCustomers: (params?: CustomerListParams) => Promise<any>
  fetchCustomer: (id: string) => Promise<any>
  createCustomer: (data: CustomerCreateData) => Promise<any>
  updateCustomer: (id: string, data: CustomerUpdateData) => Promise<any>
  deleteCustomer: (id: string) => Promise<any>
  searchCustomers: (query: string, searchType?: string) => Promise<any>
  getCustomerStats: () => Promise<any>
  blacklistCustomer: (id: string, reason: string) => Promise<any>
  activateCustomer: (id: string) => Promise<any>
  exportCustomers: (format: 'excel' | 'csv', filters?: any) => Promise<Blob>
  importCustomers: (file: File) => Promise<any>

  // Employment methods
  getEmployment: (customerId: string) => Promise<any>
  updateEmployment: (customerId: string, data: EmploymentCreateData) => Promise<any>

  // Guarantor methods
  getGuarantors: (customerId: string) => Promise<any>
  createGuarantor: (customerId: string, data: GuarantorCreateData) => Promise<any>
  getGuarantor: (id: string) => Promise<any>
  updateGuarantor: (id: string, data: Partial<GuarantorCreateData>) => Promise<any>
  deleteGuarantor: (id: string) => Promise<any>
  verifyGuarantor: (id: string, action: 'verify' | 'reject', notes: string) => Promise<any>

  // Utility
  clearCustomersError: () => void
  clearSelectedCustomerError: () => void
  clearStatsError: () => void
  clearEmploymentError: () => void
  clearGuarantorsError: () => void
  clearSearchError: () => void
  clearSelectedCustomer: () => void
  clearSelectedGuarantor: () => void
  setFilters: (filters: any) => void
  setCustomerPage: (page: number) => void
}

export const useCustomers = (): UseCustomersReturn => {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Get state from Redux store
  const {
    customers,
    customersLoading,
    customersError,
    customersPagination,
    selectedCustomer,
    selectedCustomerLoading,
    selectedCustomerError,
    stats,
    statsLoading,
    statsError,
    employment,
    employmentLoading,
    employmentError,
    guarantors,
    selectedGuarantor,
    guarantorsLoading,
    guarantorsError,
    searchResults,
    searchLoading,
    searchError,
    filters,
  } = useSelector((state: RootState) => state.customers)

  /* ===== CUSTOMER METHODS ===== */

  const fetchCustomers = useCallback(
    async (params?: CustomerListParams) => {
      return dispatch(fetchCustomersAction(params || {}))
    },
    [dispatch]
  )

  const fetchCustomer = useCallback(
    async (id: string) => {
      return dispatch(fetchCustomerByIdAction(id))
    },
    [dispatch]
  )

  const createCustomer = useCallback(
    async (data: CustomerCreateData) => {
      return dispatch(createCustomerAction(data))
    },
    [dispatch]
  )

  const updateCustomer = useCallback(
    async (id: string, data: CustomerUpdateData) => {
      return dispatch(updateCustomerAction({ id, data }))
    },
    [dispatch]
  )

  const deleteCustomer = useCallback(
    async (id: string) => {
      return dispatch(deleteCustomerAction(id))
    },
    [dispatch]
  )

  const searchCustomers = useCallback(
    async (query: string, searchType?: string) => {
      return dispatch(searchCustomersAction({ query, searchType }))
    },
    [dispatch]
  )

  const getCustomerStats = useCallback(
    async () => {
      return dispatch(fetchCustomerStatsAction())
    },
    [dispatch]
  )

  const blacklistCustomer = useCallback(
    async (id: string, reason: string) => {
      return dispatch(blacklistCustomerAction({ id, reason }))
    },
    [dispatch]
  )

  const activateCustomer = useCallback(
    async (id: string) => {
      return dispatch(activateCustomerAction(id))
    },
    [dispatch]
  )

  const exportCustomers = useCallback(
    async (format: 'excel' | 'csv', filters?: any): Promise<Blob> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.exportCustomers(format, filters)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to export customers'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const importCustomers = useCallback(
    async (file: File): Promise<any> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.importCustomers(file)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to import customers'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  /* ===== EMPLOYMENT METHODS ===== */

  const getEmployment = useCallback(
    async (customerId: string) => {
      return dispatch(fetchEmploymentAction(customerId))
    },
    [dispatch]
  )

  const updateEmployment = useCallback(
    async (customerId: string, data: EmploymentCreateData) => {
      return dispatch(updateEmploymentAction({ customerId, data }))
    },
    [dispatch]
  )

  /* ===== GUARANTOR METHODS ===== */

  const getGuarantors = useCallback(
    async (customerId: string) => {
      return dispatch(fetchGuarantorsAction(customerId))
    },
    [dispatch]
  )

  const createGuarantor = useCallback(
    async (customerId: string, data: GuarantorCreateData) => {
      return dispatch(createGuarantorAction({ customerId, data }))
    },
    [dispatch]
  )

  const getGuarantor = useCallback(
    async (id: string) => {
      return dispatch(fetchGuarantorByIdAction(id))
    },
    [dispatch]
  )

  const updateGuarantor = useCallback(
    async (id: string, data: Partial<GuarantorCreateData>) => {
      return dispatch(updateGuarantorAction({ id, data }))
    },
    [dispatch]
  )

  const deleteGuarantor = useCallback(
    async (id: string) => {
      return dispatch(deleteGuarantorAction(id))
    },
    [dispatch]
  )

  const verifyGuarantor = useCallback(
    async (id: string, action: 'verify' | 'reject', notes: string) => {
      return dispatch(verifyGuarantorAction({ id, action, notes }))
    },
    [dispatch]
  )

  /* ===== UTILITY ===== */

  // Clear local error + Redux error
  const clearError = useCallback(() => {
    setError(null)
    dispatch(clearCustomersError())
  }, [dispatch])

  return {
    // State
    customers,
    customersLoading,
    customersError,
    customersPagination,
    selectedCustomer,
    selectedCustomerLoading,
    selectedCustomerError,
    stats,
    statsLoading,
    statsError,
    employment,
    employmentLoading,
    employmentError,
    guarantors,
    selectedGuarantor,
    guarantorsLoading,
    guarantorsError,
    searchResults,
    searchLoading,
    searchError,
    filters,

    // Customer methods
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerStats,
    blacklistCustomer,
    activateCustomer,
    exportCustomers,
    importCustomers,

    // Employment methods
    getEmployment,
    updateEmployment,

    // Guarantor methods
    getGuarantors,
    createGuarantor,
    getGuarantor,
    updateGuarantor,
    deleteGuarantor,
    verifyGuarantor,

    // Utility methods
    clearCustomersError: () => dispatch(clearCustomersError()),
    clearSelectedCustomerError: () => dispatch(clearSelectedCustomerError()),
    clearStatsError: () => dispatch(clearStatsError()),
    clearEmploymentError: () => dispatch(clearEmploymentError()),
    clearGuarantorsError: () => dispatch(clearGuarantorsError()),
    clearSearchError: () => dispatch(clearSearchError()),
    clearSelectedCustomer: () => dispatch(clearSelectedCustomer()),
    clearSelectedGuarantor: () => dispatch(clearSelectedGuarantor()),
    setFilters: (filters: any) => dispatch(setFilters(filters)),
    setCustomerPage: (page: number) => dispatch(setCustomerPage(page)),
    // Local helpers
    clearError,
    isLoading,
    error,
  }
}