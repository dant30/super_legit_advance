// frontend/src/hooks/useCustomers.ts
import { useState, useCallback } from 'react'
import {
  customerAPI,
  type Customer,
  type CustomerDetailResponse,
  type CustomerListResponse,
  type CustomerStatsResponse,
  type CustomerListParams,
  type CustomerCreateData,
  type CustomerUpdateData,
  type Employment,
  type EmploymentCreateData,
  type Guarantor,
  type GuarantorCreateData,
} from '@/lib/api/customers'

interface UseCustomersReturn {
  // State
  isLoading: boolean
  error: string | null

  // Customer methods
  fetchCustomers: (params?: CustomerListParams) => Promise<CustomerListResponse>
  fetchCustomer: (id: string) => Promise<CustomerDetailResponse>
  createCustomer: (data: CustomerCreateData) => Promise<Customer>
  updateCustomer: (id: string, data: CustomerUpdateData) => Promise<Customer>
  deleteCustomer: (id: string) => Promise<void>
  searchCustomers: (query: string, searchType?: string) => Promise<Customer[]>
  getCustomerStats: () => Promise<CustomerStatsResponse>
  blacklistCustomer: (id: string, reason: string) => Promise<Customer>
  activateCustomer: (id: string) => Promise<Customer>
  exportCustomers: (format: 'excel' | 'csv', filters?: any) => Promise<Blob>
  importCustomers: (file: File) => Promise<any>

  // Employment methods
  getEmployment: (customerId: string) => Promise<Employment>
  updateEmployment: (customerId: string, data: EmploymentCreateData) => Promise<Employment>

  // Guarantor methods
  getGuarantors: (customerId: string) => Promise<Guarantor[]>
  createGuarantor: (customerId: string, data: GuarantorCreateData) => Promise<Guarantor>
  getGuarantor: (id: string) => Promise<Guarantor>
  updateGuarantor: (id: string, data: Partial<GuarantorCreateData>) => Promise<Guarantor>
  deleteGuarantor: (id: string) => Promise<void>
  verifyGuarantor: (id: string, action: 'verify' | 'reject', notes: string) => Promise<Guarantor>

  // Utility
  clearError: () => void
}

export const useCustomers = (): UseCustomersReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ===== CUSTOMER METHODS ===== */

  const fetchCustomers = useCallback(
    async (params?: CustomerListParams): Promise<CustomerListResponse> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.getCustomers(params)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to fetch customers'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const fetchCustomer = useCallback(async (id: string): Promise<CustomerDetailResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customerAPI.getCustomer(id)
      setIsLoading(false)
      return response
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch customer'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const createCustomer = useCallback(
    async (data: CustomerCreateData): Promise<Customer> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.createCustomer(data)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to create customer'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const updateCustomer = useCallback(
    async (id: string, data: CustomerUpdateData): Promise<Customer> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.updateCustomer(id, data)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to update customer'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await customerAPI.deleteCustomer(id)
      setIsLoading(false)
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete customer'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const searchCustomers = useCallback(
    async (query: string, searchType?: string): Promise<Customer[]> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.searchCustomers(query, searchType)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to search customers'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const getCustomerStats = useCallback(async (): Promise<CustomerStatsResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customerAPI.getCustomerStats()
      setIsLoading(false)
      return response
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to fetch customer statistics'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const blacklistCustomer = useCallback(
    async (id: string, reason: string): Promise<Customer> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.blacklistCustomer(id, reason)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to blacklist customer'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const activateCustomer = useCallback(async (id: string): Promise<Customer> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customerAPI.activateCustomer(id)
      setIsLoading(false)
      return response
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to activate customer'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

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

  const importCustomers = useCallback(async (file: File): Promise<any> => {
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
  }, [])

  /* ===== EMPLOYMENT METHODS ===== */

  const getEmployment = useCallback(async (customerId: string): Promise<Employment> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customerAPI.getEmployment(customerId)
      setIsLoading(false)
      return response
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to fetch employment'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateEmployment = useCallback(
    async (customerId: string, data: EmploymentCreateData): Promise<Employment> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.updateEmployment(customerId, data)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to update employment'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  /* ===== GUARANTOR METHODS ===== */

  const getGuarantors = useCallback(async (customerId: string): Promise<Guarantor[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customerAPI.getGuarantors(customerId)
      setIsLoading(false)
      return response
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to fetch guarantors'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const createGuarantor = useCallback(
    async (customerId: string, data: GuarantorCreateData): Promise<Guarantor> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.createGuarantor(customerId, data)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to create guarantor'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const getGuarantor = useCallback(async (id: string): Promise<Guarantor> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customerAPI.getGuarantor(id)
      setIsLoading(false)
      return response
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to fetch guarantor'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateGuarantor = useCallback(
    async (id: string, data: Partial<GuarantorCreateData>): Promise<Guarantor> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.updateGuarantor(id, data)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to update guarantor'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const deleteGuarantor = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await customerAPI.deleteGuarantor(id)
      setIsLoading(false)
    } catch (err: any) {
      setIsLoading(false)
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to delete guarantor'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const verifyGuarantor = useCallback(
    async (id: string, action: 'verify' | 'reject', notes: string): Promise<Guarantor> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await customerAPI.verifyGuarantor(id, action, notes)
        setIsLoading(false)
        return response
      } catch (err: any) {
        setIsLoading(false)
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to verify guarantor'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  /* ===== UTILITY ===== */

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isLoading,
    error,

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

    // Utility
    clearError,
  }
}