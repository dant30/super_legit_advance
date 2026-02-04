// frontend/src/hooks/useCustomers.js
import { useState, useCallback, useRef, useEffect } from 'react'
import customerAPI from '../api/customers'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'

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

  const abortRef = useRef(null)
  const { user } = useAuth()
  const { addToast } = useToast()

  // Helper to update state
  const setStatePartial = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  // Helper to handle API calls with loading/error states
  const callApi = useCallback(async (apiFn, loadingKey = null, errorKey = null) => {
    if (loadingKey) setStatePartial({ [loadingKey]: true, [errorKey]: null })
    try {
      const result = await apiFn()
      if (loadingKey) setStatePartial({ [loadingKey]: false })
      if (!result || result.success === false) {
        const err = result?.error || 'Request failed'
        if (errorKey) setStatePartial({ [errorKey]: err })
        return { success: false, error: err }
      }
      return { success: true, data: result.data, pagination: result.pagination || null, filename: result.filename || null }
    } catch (error) {
      if (loadingKey) setStatePartial({ [loadingKey]: false })
      const msg = error?.message || 'An error occurred'
      if (errorKey) setStatePartial({ [errorKey]: msg })
      addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }, [setStatePartial, addToast])

  /* ===== CUSTOMER METHODS ===== */

  const fetchCustomers = useCallback(async (params = {}) => {
    const merged = {
      page: state.customersPagination.page,
      page_size: state.customersPagination.page_size,
      ...state.filters,
      ...params,
    }

    const res = await callApi(() => customerAPI.getCustomers(merged), 'customersLoading', 'customersError')
    if (res.success) {
      const payload = res.data || []
      // If backend returned page object {results, pagination}
      if (payload.results) {
        setStatePartial({
          customers: payload.results,
          customersPagination: {
            ...state.customersPagination,
            page: payload.page || state.customersPagination.page,
            page_size: payload.page_size || state.customersPagination.page_size,
            total: payload.pagination?.total || payload.count || state.customersPagination.total,
            total_pages: payload.pagination?.total_pages || Math.ceil((payload.count || 0) / (payload.page_size || state.customersPagination.page_size) || 1)
          }
        })
      } else if (Array.isArray(payload)) {
        setStatePartial({ customers: payload })
      } else {
        setStatePartial({ customers: Array.isArray(payload.data) ? payload.data : [] })
      }
      addToast(`Loaded ${Array.isArray(state.customers) ? state.customers.length : 0} customers`, 'success')
    }
    return res
  }, [state.customersPagination, state.filters, callApi, setStatePartial, addToast, state.customers])

  const fetchCustomer = useCallback(async (id) => {
    const res = await callApi(() => customerAPI.getCustomer(id), 'selectedCustomerLoading', 'selectedCustomerError')
    if (res.success) setStatePartial({ selectedCustomer: res.data })
    return res
  }, [callApi, setStatePartial])

  const createCustomer = useCallback(async (data) => {
    const res = await callApi(() => customerAPI.createCustomer(data), 'customersLoading', 'customersError')
    if (res.success) {
      setState(prev => ({ ...prev, customers: [res.data, ...prev.customers] }))
      addToast('Customer created', 'success')
    }
    return res
  }, [callApi, addToast])

  const updateCustomer = useCallback(async (id, data) => {
    const res = await callApi(() => customerAPI.updateCustomer(id, data), 'customersLoading', 'customersError')
    if (res.success) {
      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => (c.id === id ? { ...c, ...res.data } : c)),
        selectedCustomer: prev.selectedCustomer?.id === id ? { ...prev.selectedCustomer, ...res.data } : prev.selectedCustomer
      }))
      addToast('Customer updated', 'success')
    }
    return res
  }, [callApi, addToast])

  const deleteCustomer = useCallback(async (id) => {
    const res = await callApi(() => customerAPI.deleteCustomer(id), 'customersLoading', 'customersError')
    if (res.success) {
      setState(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id), selectedCustomer: prev.selectedCustomer?.id === id ? null : prev.selectedCustomer }))
      addToast('Customer deleted', 'success')
    }
    return res
  }, [callApi, addToast])

  const searchCustomers = useCallback(async (query, type = 'basic') => {
    const res = await callApi(() => customerAPI.searchCustomers(query, type), 'searchLoading', 'searchError')
    if (res.success) setStatePartial({ searchResults: res.data || [] })
    return res
  }, [callApi, setStatePartial])

  const getCustomerStats = useCallback(async () => {
    const res = await callApi(() => customerAPI.getCustomerStats(), 'statsLoading', 'statsError')
    if (res.success) setStatePartial({ stats: res.data })
    return res
  }, [callApi, setStatePartial])

  const blacklistCustomer = useCallback(async (id, reason) => {
    const res = await callApi(() => customerAPI.blacklistCustomer(id, reason), 'customersLoading', 'customersError')
    if (res.success) {
      setState(prev => ({ ...prev, customers: prev.customers.map(c => c.id === id ? res.data : c), selectedCustomer: prev.selectedCustomer?.id === id ? res.data : prev.selectedCustomer }))
      addToast('Customer blacklisted', 'success')
    }
    return res
  }, [callApi, addToast])

  const activateCustomer = useCallback(async (id) => {
    const res = await callApi(() => customerAPI.activateCustomer(id), 'customersLoading', 'customersError')
    if (res.success) {
      setState(prev => ({ ...prev, customers: prev.customers.map(c => c.id === id ? res.data : c), selectedCustomer: prev.selectedCustomer?.id === id ? res.data : prev.selectedCustomer }))
      addToast('Customer activated', 'success')
    }
    return res
  }, [callApi, addToast])

  const exportCustomers = useCallback(async (format = 'excel', filters = {}) => {
    const res = await callApi(() => customerAPI.exportCustomers(format, filters))
    if (res.success && res.filename !== undefined) {
      const blob = res.data
      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      a.download = `customers_export.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      addToast('Export ready', 'success')
    }
    return res
  }, [callApi, addToast])

  const importCustomers = useCallback(async (file) => {
    const res = await callApi(() => customerAPI.importCustomers(file))
    if (res.success) {
      addToast(res.message || 'Import completed', 'success')
      fetchCustomers()
    }
    return res
  }, [callApi, addToast, fetchCustomers])

  /* ===== EMPLOYMENT METHODS ===== */

  const getEmployment = useCallback(async (customerId) => {
    const res = await callApi(() => customerAPI.getEmployment(customerId), 'employmentLoading', 'employmentError')
    if (res.success) setStatePartial({ employment: res.data })
    return res
  }, [callApi, setStatePartial])

  const updateEmployment = useCallback(async (customerId, data) => {
    const res = await callApi(() => customerAPI.updateEmployment(customerId, data), 'employmentLoading', 'employmentError')
    if (res.success) {
      setState(prev => ({ ...prev, employment: res.data, selectedCustomer: prev.selectedCustomer?.id === customerId ? { ...prev.selectedCustomer, employment: res.data } : prev.selectedCustomer }))
      addToast('Employment updated', 'success')
    }
    return res
  }, [callApi, addToast])

  /* ===== GUARANTOR METHODS ===== */

  const getGuarantors = useCallback(async (customerId) => {
    const res = await callApi(() => customerAPI.getGuarantors(customerId), 'guarantorsLoading', 'guarantorsError')
    if (res.success) setStatePartial({ guarantors: res.data || [] })
    return res
  }, [callApi, setStatePartial])

  const createGuarantor = useCallback(async (customerId, data) => {
    const res = await callApi(() => customerAPI.createGuarantor(customerId, data), 'guarantorsLoading', 'guarantorsError')
    if (res.success) setState(prev => ({ ...prev, guarantors: [res.data, ...prev.guarantors] }), addToast('Guarantor created', 'success'))
    return res
  }, [callApi, addToast])

  const updateGuarantor = useCallback(async (id, data) => {
    const res = await callApi(() => customerAPI.updateGuarantor(id, data), 'guarantorsLoading', 'guarantorsError')
    if (res.success) setState(prev => ({ ...prev, guarantors: prev.guarantors.map(g => g.id === id ? res.data : g), selectedGuarantor: prev.selectedGuarantor?.id === id ? res.data : prev.selectedGuarantor }), addToast('Guarantor updated', 'success'))
    return res
  }, [callApi, addToast])

  const deleteGuarantor = useCallback(async (id) => {
    const res = await callApi(() => customerAPI.deleteGuarantor(id), 'guarantorsLoading', 'guarantorsError')
    if (res.success) setState(prev => ({ ...prev, guarantors: prev.guarantors.filter(g => g.id !== id) }), addToast('Guarantor removed', 'success'))
    return res
  }, [callApi, addToast])

    const verifyGuarantor = useCallback(async (id, action, notes = '') => {
      const res = await callApi(() => customerAPI.verifyGuarantor(id, action, notes), 'guarantorsLoading', 'guarantorsError')
      if (res.success) {
        setState(prev => ({ ...prev, guarantors: prev.guarantors.map(g => g.id === id ? res.data : g), selectedGuarantor: prev.selectedGuarantor?.id === id ? res.data : prev.selectedGuarantor }))
        addToast('Guarantor verified', 'success')
      }
      return res
    }, [callApi, addToast])
  
    return {
      // List
      customers: state.customers,
      customersLoading: state.customersLoading,
      customersError: state.customersError,
      customersPagination: state.customersPagination,
      fetchCustomers,
      createCustomer,
      updateCustomer,
      deleteCustomer,
  
      // Detail
      selectedCustomer: state.selectedCustomer,
      selectedCustomerLoading: state.selectedCustomerLoading,
      selectedCustomerError: state.selectedCustomerError,
      fetchCustomer,
  
      // Stats
      stats: state.stats,
      statsLoading: state.statsLoading,
      statsError: state.statsError,
      getCustomerStats,
  
      // Employment
      employment: state.employment,
      employmentLoading: state.employmentLoading,
      employmentError: state.employmentError,
      getEmployment,
      updateEmployment,
  
      // Guarantors
      guarantors: state.guarantors,
      selectedGuarantor: state.selectedGuarantor,
      guarantorsLoading: state.guarantorsLoading,
      guarantorsError: state.guarantorsError,
      getGuarantors,
      createGuarantor,
      updateGuarantor,
      deleteGuarantor,
      verifyGuarantor,
  
      // Search
      searchResults: state.searchResults,
      searchLoading: state.searchLoading,
      searchError: state.searchError,
      searchCustomers,
  
      // Actions
      blacklistCustomer,
      activateCustomer,
      exportCustomers,
      importCustomers,
  
      // Filters
      filters: state.filters,
      setStatePartial,
    }
  }