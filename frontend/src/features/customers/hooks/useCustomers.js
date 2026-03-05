import { useCallback, useRef, useState } from 'react'
import { useToast } from '@contexts/ToastContext'
import customerAPI, { normalizeCustomerEntity } from '../services/customers'
import {
  CUSTOMER_DEFAULT_PAGINATION,
  CUSTOMER_EXPORT_FORMAT,
  CUSTOMER_INITIAL_STATE,
  CUSTOMER_SEARCH_TYPE,
  CUSTOMER_STATUS,
} from '../types'

export const useCustomers = () => {
  const [state, setState] = useState(CUSTOMER_INITIAL_STATE)
  const { addToast } = useToast()

  const inFlightRef = useRef({
    fetchCustomers: false,
    fetchCustomer: false,
    getEmployment: false,
    getGuarantors: false,
  })

  const setStatePartial = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const callApi = useCallback(
    async (apiFn, loadingKey = null, errorKey = null) => {
      if (loadingKey) {
        setStatePartial({ [loadingKey]: true, [errorKey]: null })
      }

      try {
        const result = await apiFn()
        if (loadingKey) setStatePartial({ [loadingKey]: false })

        if (!result || result.success === false) {
          const rawError = result?.error
          const errorMessage = typeof rawError === 'string' ? rawError : 'Request failed'
          if (errorKey) setStatePartial({ [errorKey]: errorMessage })
          return { success: false, error: errorMessage }
        }

        return {
          success: true,
          data: result.data,
          pagination: result.pagination || null,
          filename: result.filename || null,
          message: result.message || null,
        }
      } catch (error) {
        if (loadingKey) setStatePartial({ [loadingKey]: false })
        const errorMessage = error?.message || 'An error occurred'
        if (errorKey) setStatePartial({ [errorKey]: errorMessage })
        addToast(errorMessage, 'error')
        return { success: false, error: errorMessage }
      }
    },
    [setStatePartial, addToast]
  )

  const buildListPagination = useCallback((payload, previous) => {
    if (!payload?.results) return previous

    const pageSize = payload.page_size || previous.page_size || CUSTOMER_DEFAULT_PAGINATION.page_size
    const total = payload.pagination?.total || payload.count || previous.total || 0
    const totalPages =
      payload.pagination?.total_pages ||
      Math.max(1, Math.ceil(total / (pageSize || 1)))

    return {
      ...previous,
      page: payload.page || previous.page,
      page_size: pageSize,
      total,
      total_pages: totalPages,
    }
  }, [])

  const fetchCustomers = useCallback(
    async (params = {}) => {
      if (inFlightRef.current.fetchCustomers) {
        return { success: false, error: 'Request in progress' }
      }
      inFlightRef.current.fetchCustomers = true

      const mergedParams = {
        page: state.customersPagination.page,
        page_size: state.customersPagination.page_size,
        ...state.filters,
        ...params,
      }

      const response = await callApi(
        () => customerAPI.getCustomers(mergedParams),
        'customersLoading',
        'customersError'
      )

      if (response.success) {
        const payload = response.data
        if (payload?.results) {
          setState((prev) => ({
            ...prev,
            customers: payload.results,
            customersPagination: buildListPagination(payload, prev.customersPagination),
          }))
        } else if (Array.isArray(payload)) {
          setStatePartial({ customers: payload })
        } else {
          setStatePartial({ customers: Array.isArray(payload?.data) ? payload.data : [] })
        }
      }

      inFlightRef.current.fetchCustomers = false
      return response
    },
    [state.customersPagination, state.filters, callApi, setStatePartial, buildListPagination]
  )

  const fetchCustomer = useCallback(
    async (id) => {
      if (inFlightRef.current.fetchCustomer) {
        return { success: false, error: 'Request in progress' }
      }
      inFlightRef.current.fetchCustomer = true

      const response = await callApi(
        () => customerAPI.getCustomer(id),
        'selectedCustomerLoading',
        'selectedCustomerError'
      )

      if (response.success) {
        setStatePartial({ selectedCustomer: normalizeCustomerEntity(response.data) })
      }

      inFlightRef.current.fetchCustomer = false
      return response
    },
    [callApi, setStatePartial]
  )

  const createCustomer = useCallback(
    async (data) => {
      const response = await callApi(
        () => customerAPI.createCustomer(data),
        'customersLoading',
        'customersError'
      )
      if (response.success) {
        const nextCustomer = normalizeCustomerEntity(response.data)
        setState((prev) => ({ ...prev, customers: [nextCustomer, ...prev.customers] }))
        addToast('Customer created', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const updateCustomer = useCallback(
    async (id, data) => {
      const response = await callApi(
        () => customerAPI.updateCustomer(id, data),
        'customersLoading',
        'customersError'
      )
      if (response.success) {
        const nextCustomer = normalizeCustomerEntity(response.data)
        setState((prev) => ({
          ...prev,
          customers: prev.customers.map((customer) =>
            customer.id === id ? { ...customer, ...nextCustomer } : customer
          ),
          selectedCustomer:
            prev.selectedCustomer?.id === id
              ? { ...prev.selectedCustomer, ...nextCustomer }
              : prev.selectedCustomer,
        }))
        addToast('Customer updated', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const deleteCustomer = useCallback(
    async (id) => {
      const response = await callApi(
        () => customerAPI.deleteCustomer(id),
        'customersLoading',
        'customersError'
      )
      if (response.success) {
        setState((prev) => ({
          ...prev,
          customers: prev.customers.filter((customer) => customer.id !== id),
          selectedCustomer: prev.selectedCustomer?.id === id ? null : prev.selectedCustomer,
        }))
        addToast('Customer deleted', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const searchCustomers = useCallback(
    async (query, type = CUSTOMER_SEARCH_TYPE.basic) => {
      const response = await callApi(
        () => customerAPI.searchCustomers(query, type),
        'searchLoading',
        'searchError'
      )
      if (response.success) {
        setStatePartial({ searchResults: response.data || [] })
      }
      return response
    },
    [callApi, setStatePartial]
  )

  const getCustomerStats = useCallback(async () => {
    const response = await callApi(
      () => customerAPI.getCustomerStats(),
      'statsLoading',
      'statsError'
    )
    if (response.success) {
      setStatePartial({ stats: response.data })
    }
    return response
  }, [callApi, setStatePartial])

  const blacklistCustomer = useCallback(
    async (id, reason) => {
      const response = await callApi(
        () => customerAPI.blacklistCustomer(id, reason),
        'customersLoading',
        'customersError'
      )
      if (response.success) {
        const nextCustomer = normalizeCustomerEntity(response.data)
        setState((prev) => ({
          ...prev,
          customers: prev.customers.map((customer) =>
            customer.id === id ? nextCustomer : customer
          ),
          selectedCustomer:
            prev.selectedCustomer?.id === id ? nextCustomer : prev.selectedCustomer,
        }))
        addToast('Customer blacklisted', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const activateCustomer = useCallback(
    async (id) => {
      const response = await callApi(
        () => customerAPI.activateCustomer(id),
        'customersLoading',
        'customersError'
      )
      if (response.success) {
        const nextCustomer = normalizeCustomerEntity(response.data)
        setState((prev) => ({
          ...prev,
          customers: prev.customers.map((customer) =>
            customer.id === id ? nextCustomer : customer
          ),
          selectedCustomer:
            prev.selectedCustomer?.id === id ? nextCustomer : prev.selectedCustomer,
        }))
        addToast('Customer activated', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const exportCustomers = useCallback(
    async (format = CUSTOMER_EXPORT_FORMAT.excel, filters = {}) => {
      const response = await callApi(() => customerAPI.exportCustomers(format, filters))
      if (response.success && response.data) {
        const blob = response.data
        const url = window.URL.createObjectURL(new Blob([blob]))
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `customers_export.${format === CUSTOMER_EXPORT_FORMAT.excel ? 'xlsx' : 'csv'}`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        addToast('Export ready', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const importCustomers = useCallback(
    async (file) => {
      const response = await callApi(() => customerAPI.importCustomers(file))
      if (response.success) {
        addToast(response.message || 'Import completed', 'success')
        await fetchCustomers()
      }
      return response
    },
    [callApi, addToast, fetchCustomers]
  )

  const getEmployment = useCallback(
    async (customerId) => {
      if (inFlightRef.current.getEmployment) {
        return { success: false, error: 'Request in progress' }
      }
      inFlightRef.current.getEmployment = true

      const response = await callApi(
        () => customerAPI.getEmployment(customerId),
        'employmentLoading',
        'employmentError'
      )
      if (response.success) {
        setStatePartial({ employment: response.data })
      }

      inFlightRef.current.getEmployment = false
      return response
    },
    [callApi, setStatePartial]
  )

  const updateEmployment = useCallback(
    async (customerId, data) => {
      const response = await callApi(
        () => customerAPI.updateEmployment(customerId, data),
        'employmentLoading',
        'employmentError'
      )
      if (response.success) {
        setState((prev) => ({
          ...prev,
          employment: response.data,
          selectedCustomer:
            prev.selectedCustomer?.id === customerId
              ? { ...prev.selectedCustomer, employment: response.data }
              : prev.selectedCustomer,
        }))
        addToast('Employment updated', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const getGuarantors = useCallback(
    async (customerId) => {
      if (inFlightRef.current.getGuarantors) {
        return { success: false, error: 'Request in progress' }
      }
      inFlightRef.current.getGuarantors = true

      const response = await callApi(
        () => customerAPI.getGuarantors(customerId),
        'guarantorsLoading',
        'guarantorsError'
      )
      if (response.success) {
        setStatePartial({ guarantors: response.data || [] })
      }

      inFlightRef.current.getGuarantors = false
      return response
    },
    [callApi, setStatePartial]
  )

  const createGuarantor = useCallback(
    async (customerId, data) => {
      const response = await callApi(
        () => customerAPI.createGuarantor(customerId, data),
        'guarantorsLoading',
        'guarantorsError'
      )
      if (response.success) {
        setState((prev) => ({ ...prev, guarantors: [response.data, ...prev.guarantors] }))
        addToast('Guarantor created', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const updateGuarantor = useCallback(
    async (id, data) => {
      const response = await callApi(
        () => customerAPI.updateGuarantor(id, data),
        'guarantorsLoading',
        'guarantorsError'
      )
      if (response.success) {
        setState((prev) => ({
          ...prev,
          guarantors: prev.guarantors.map((guarantor) =>
            guarantor.id === id ? response.data : guarantor
          ),
          selectedGuarantor:
            prev.selectedGuarantor?.id === id ? response.data : prev.selectedGuarantor,
        }))
        addToast('Guarantor updated', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const deleteGuarantor = useCallback(
    async (id) => {
      const response = await callApi(
        () => customerAPI.deleteGuarantor(id),
        'guarantorsLoading',
        'guarantorsError'
      )
      if (response.success) {
        setState((prev) => ({
          ...prev,
          guarantors: prev.guarantors.filter((guarantor) => guarantor.id !== id),
        }))
        addToast('Guarantor removed', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const verifyGuarantor = useCallback(
    async (id, action, notes = '') => {
      const response = await callApi(
        () => customerAPI.verifyGuarantor(id, action, notes),
        'guarantorsLoading',
        'guarantorsError'
      )
      if (response.success) {
        setState((prev) => ({
          ...prev,
          guarantors: prev.guarantors.map((guarantor) =>
            guarantor.id === id ? response.data : guarantor
          ),
          selectedGuarantor:
            prev.selectedGuarantor?.id === id ? response.data : prev.selectedGuarantor,
        }))
        addToast('Guarantor verified', 'success')
      }
      return response
    },
    [callApi, addToast]
  )

  const setFilters = useCallback((filters) => {
    setStatePartial({ filters: filters || {} })
  }, [setStatePartial])

  return {
    customers: state.customers,
    customersLoading: state.customersLoading,
    customersError: state.customersError,
    customersPagination: state.customersPagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    selectedCustomer: state.selectedCustomer,
    selectedCustomerLoading: state.selectedCustomerLoading,
    selectedCustomerError: state.selectedCustomerError,
    fetchCustomer,
    stats: state.stats,
    statsLoading: state.statsLoading,
    statsError: state.statsError,
    getCustomerStats,
    employment: state.employment,
    employmentLoading: state.employmentLoading,
    employmentError: state.employmentError,
    getEmployment,
    updateEmployment,
    guarantors: state.guarantors,
    selectedGuarantor: state.selectedGuarantor,
    guarantorsLoading: state.guarantorsLoading,
    guarantorsError: state.guarantorsError,
    getGuarantors,
    createGuarantor,
    updateGuarantor,
    deleteGuarantor,
    verifyGuarantor,
    searchResults: state.searchResults,
    searchLoading: state.searchLoading,
    searchError: state.searchError,
    searchCustomers,
    blacklistCustomer,
    activateCustomer,
    exportCustomers,
    importCustomers,
    filters: state.filters,
    setFilters,
    setStatePartial,
    status: CUSTOMER_STATUS,
  }
}

export default useCustomers
