// frontend/src/hooks/useCustomers.js
import { useState, useCallback, useContext } from 'react'
import customerAPI from '@/api/customers'
import { AuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export const useCustomers = () => {
  const [state, setState] = useState({
    // List state
    customers: [],
    customersLoading: false,
    customersError: null,
    customersPagination: {
      page: 1,
      page_size: 20,
      total: 0,
      total_pages: 0,
    },

    // Detail state
    selectedCustomer: null,
    selectedCustomerLoading: false,
    selectedCustomerError: null,

    // Stats state
    stats: null,
    statsLoading: false,
    statsError: null,

    // Employment state
    employment: null,
    employmentLoading: false,
    employmentError: null,

    // Guarantors state
    guarantors: [],
    selectedGuarantor: null,
    guarantorsLoading: false,
    guarantorsError: null,

    // Search state
    searchResults: [],
    searchLoading: false,
    searchError: null,

    // Filters
    filters: {},
  })

  const { user } = useContext(AuthContext)
  const { showToast } = useToast()

  // Helper to update state
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Helper to handle API calls with loading/error states
  const callApi = useCallback(async (apiCall, loadingKey = null, errorKey = null) => {
    if (loadingKey) {
      updateState({ [loadingKey]: true, [errorKey]: null })
    }

    try {
      const result = await apiCall()
      
      if (loadingKey) {
        updateState({ [loadingKey]: false })
      }

      if (!result.success) {
        if (errorKey) {
          updateState({ [errorKey]: result.error })
        }
        showToast(result.error, 'error')
        return { success: false, error: result.error }
      }

      return { success: true, data: result.data }
    } catch (error) {
      if (loadingKey) {
        updateState({ [loadingKey]: false })
      }
      if (errorKey) {
        updateState({ [errorKey]: error.message })
      }
      showToast(error.message || 'An error occurred', 'error')
      return { success: false, error: error.message }
    }
  }, [updateState, showToast])

  /* ===== CUSTOMER METHODS ===== */

  const fetchCustomers = useCallback(async (params = {}) => {
    const mergedParams = {
      page: state.customersPagination.page,
      page_size: state.customersPagination.page_size,
      ...state.filters,
      ...params,
    }

    const result = await callApi(
      () => customerAPI.getCustomers(mergedParams),
      'customersLoading',
      'customersError'
    )

    if (result.success) {
      const data = result.data
      let customers = []
      let pagination = { ...state.customersPagination }

      if (data.data) {
        // New format with data and pagination
        customers = data.data
        if (data.pagination) {
          pagination = {
            page: data.pagination.page || 1,
            page_size: data.pagination.page_size || 20,
            total: data.pagination.total || 0,
            total_pages: data.pagination.total_pages || 0,
          }
        }
      } else if (data.results) {
        // Old DRF format
        customers = data.results
        pagination = {
          page: data.page || 1,
          page_size: data.page_size || 20,
          total: data.count || 0,
          total_pages: data.total_pages || Math.ceil((data.count || 0) / 20),
        }
      } else {
        // Array response
        customers = Array.isArray(data) ? data : []
      }

      updateState({
        customers,
        customersPagination: pagination,
      })

      showToast(`Loaded ${customers.length} customers`, 'success')
    }

    return result
  }, [state.filters, state.customersPagination, callApi, updateState, showToast])

  const fetchCustomer = useCallback(async (id) => {
    const result = await callApi(
      () => customerAPI.getCustomer(id),
      'selectedCustomerLoading',
      'selectedCustomerError'
    )

    if (result.success) {
      updateState({ selectedCustomer: result.data })
    }

    return result
  }, [callApi, updateState])

  const createCustomer = useCallback(async (customerData) => {
    const result = await callApi(
      () => customerAPI.createCustomer(customerData),
      'customersLoading',
      'customersError'
    )

    if (result.success) {
      updateState(prev => ({
        customers: [result.data, ...prev.customers],
      }))
      showToast('Customer created successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const updateCustomer = useCallback(async (id, customerData) => {
    const result = await callApi(
      () => customerAPI.updateCustomer(id, customerData),
      'customersLoading',
      'customersError'
    )

    if (result.success) {
      updateState(prev => ({
        customers: prev.customers.map(customer =>
          customer.id === id ? { ...customer, ...result.data } : customer
        ),
        selectedCustomer: prev.selectedCustomer?.id === id
          ? { ...prev.selectedCustomer, ...result.data }
          : prev.selectedCustomer,
      }))
      showToast('Customer updated successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const deleteCustomer = useCallback(async (id) => {
    const result = await callApi(
      () => customerAPI.deleteCustomer(id),
      'customersLoading',
      'customersError'
    )

    if (result.success) {
      updateState(prev => ({
        customers: prev.customers.filter(customer => customer.id !== id),
        selectedCustomer: prev.selectedCustomer?.id === id ? null : prev.selectedCustomer,
      }))
      showToast('Customer deleted successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const searchCustomers = useCallback(async (query, searchType = 'basic') => {
    const result = await callApi(
      () => customerAPI.searchCustomers(query, searchType),
      'searchLoading',
      'searchError'
    )

    if (result.success) {
      updateState({ searchResults: result.data || [] })
    }

    return result
  }, [callApi, updateState])

  const getCustomerStats = useCallback(async () => {
    const result = await callApi(
      () => customerAPI.getCustomerStats(),
      'statsLoading',
      'statsError'
    )

    if (result.success) {
      updateState({ stats: result.data })
    }

    return result
  }, [callApi, updateState])

  const blacklistCustomer = useCallback(async (id, reason) => {
    const result = await callApi(
      () => customerAPI.blacklistCustomer(id, reason),
      'customersLoading',
      'customersError'
    )

    if (result.success) {
      updateState(prev => ({
        customers: prev.customers.map(customer =>
          customer.id === id ? result.data : customer
        ),
        selectedCustomer: prev.selectedCustomer?.id === id
          ? result.data
          : prev.selectedCustomer,
      }))
      showToast('Customer blacklisted successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const activateCustomer = useCallback(async (id) => {
    const result = await callApi(
      () => customerAPI.activateCustomer(id),
      'customersLoading',
      'customersError'
    )

    if (result.success) {
      updateState(prev => ({
        customers: prev.customers.map(customer =>
          customer.id === id ? result.data : customer
        ),
        selectedCustomer: prev.selectedCustomer?.id === id
          ? result.data
          : prev.selectedCustomer,
      }))
      showToast('Customer activated successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const exportCustomers = useCallback(async (format = 'excel', filters = {}) => {
    const result = await callApi(() => customerAPI.exportCustomers(format, filters))

    if (result.success) {
      // Create download link
      const url = window.URL.createObjectURL(result.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers_export.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showToast('Export completed successfully', 'success')
    }

    return result
  }, [callApi, showToast])

  const importCustomers = useCallback(async (file) => {
    const result = await callApi(() => customerAPI.importCustomers(file))

    if (result.success) {
      showToast(`Successfully imported ${result.data.imported_count || 0} customers`, 'success')
      // Refresh customer list
      fetchCustomers()
    }

    return result
  }, [callApi, showToast, fetchCustomers])

  /* ===== EMPLOYMENT METHODS ===== */

  const getEmployment = useCallback(async (customerId) => {
    const result = await callApi(
      () => customerAPI.getEmployment(customerId),
      'employmentLoading',
      'employmentError'
    )

    if (result.success) {
      updateState({ employment: result.data })
    }

    return result
  }, [callApi, updateState])

  const updateEmployment = useCallback(async (customerId, employmentData) => {
    const result = await callApi(
      () => customerAPI.updateEmployment(customerId, employmentData),
      'employmentLoading',
      'employmentError'
    )

    if (result.success) {
      updateState({
        employment: result.data,
        selectedCustomer: state.selectedCustomer
          ? { ...state.selectedCustomer, employment: result.data }
          : state.selectedCustomer,
      })
      showToast('Employment information updated successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast, state.selectedCustomer])

  /* ===== GUARANTOR METHODS ===== */

  const getGuarantors = useCallback(async (customerId) => {
    const result = await callApi(
      () => customerAPI.getGuarantors(customerId),
      'guarantorsLoading',
      'guarantorsError'
    )

    if (result.success) {
      updateState({ guarantors: result.data || [] })
    }

    return result
  }, [callApi, updateState])

  const createGuarantor = useCallback(async (customerId, guarantorData) => {
    const result = await callApi(
      () => customerAPI.createGuarantor(customerId, guarantorData),
      'guarantorsLoading',
      'guarantorsError'
    )

    if (result.success) {
      updateState(prev => ({
        guarantors: [result.data, ...prev.guarantors],
      }))
      showToast('Guarantor created successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const getGuarantor = useCallback(async (id) => {
    const result = await callApi(
      () => customerAPI.getGuarantor(id),
      'guarantorsLoading',
      'guarantorsError'
    )

    if (result.success) {
      updateState({ selectedGuarantor: result.data })
    }

    return result
  }, [callApi, updateState])

  const updateGuarantor = useCallback(async (id, guarantorData) => {
    const result = await callApi(
      () => customerAPI.updateGuarantor(id, guarantorData),
      'guarantorsLoading',
      'guarantorsError'
    )

    if (result.success) {
      updateState(prev => ({
        guarantors: prev.guarantors.map(guarantor =>
          guarantor.id === id ? result.data : guarantor
        ),
        selectedGuarantor: prev.selectedGuarantor?.id === id
          ? result.data
          : prev.selectedGuarantor,
      }))
      showToast('Guarantor updated successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const deleteGuarantor = useCallback(async (id) => {
    const result = await callApi(
      () => customerAPI.deleteGuarantor(id),
      'guarantorsLoading',
      'guarantorsError'
    )

    if (result.success) {
      updateState(prev => ({
        guarantors: prev.guarantors.filter(guarantor => guarantor.id !== id),
        selectedGuarantor: prev.selectedGuarantor?.id === id ? null : prev.selectedGuarantor,
      }))
      showToast('Guarantor deleted successfully', 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  const verifyGuarantor = useCallback(async (id, action, notes) => {
    const result = await callApi(
      () => customerAPI.verifyGuarantor(id, action, notes),
      'guarantorsLoading',
      'guarantorsError'
    )

    if (result.success) {
      updateState(prev => ({
        guarantors: prev.guarantors.map(guarantor =>
          guarantor.id === id ? result.data : guarantor
        ),
        selectedGuarantor: prev.selectedGuarantor?.id === id
          ? result.data
          : prev.selectedGuarantor,
      }))
      showToast(`Guarantor ${action}ed successfully`, 'success')
    }

    return result
  }, [callApi, updateState, showToast])

  /* ===== UTILITY METHODS ===== */

  const setFilters = useCallback((filters) => {
    updateState({
      filters: { ...state.filters, ...filters },
      customersPagination: { ...state.customersPagination, page: 1 },
    })
  }, [state.filters, state.customersPagination, updateState])

  const setCustomerPage = useCallback((page) => {
    updateState({
      customersPagination: { ...state.customersPagination, page },
    })
  }, [state.customersPagination, updateState])

  const clearError = useCallback(() => {
    updateState({
      customersError: null,
      selectedCustomerError: null,
      statsError: null,
      employmentError: null,
      guarantorsError: null,
      searchError: null,
    })
  }, [updateState])

  const clearSelectedCustomer = useCallback(() => {
    updateState({ selectedCustomer: null })
  }, [updateState])

  const clearSelectedGuarantor = useCallback(() => {
    updateState({ selectedGuarantor: null })
  }, [updateState])

  const clearSearchResults = useCallback(() => {
    updateState({ searchResults: [] })
  }, [updateState])

  return {
    // State
    ...state,
    
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
    setFilters,
    setCustomerPage,
    clearError,
    clearSelectedCustomer,
    clearSelectedGuarantor,
    clearSearchResults,
    
    // Derived state
    isLoading: state.customersLoading || state.selectedCustomerLoading || 
               state.statsLoading || state.employmentLoading || 
               state.guarantorsLoading || state.searchLoading,
    
    // Permission checks (using auth context)
    canManageCustomers: user?.is_staff || user?.role === 'admin' || user?.role === 'staff',
    canApproveCustomers: user?.role === 'admin' || user?.role === 'manager',
  }
}