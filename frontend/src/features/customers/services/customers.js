import axios from '@api/axios'

export const CUSTOMER_ENDPOINTS = Object.freeze({
  base: '/customers',
  list: '/customers/',
  detail: (id) => `/customers/${id}/`,
  create: '/customers/create/',
  search: '/customers/search/',
  stats: '/customers/stats/',
  blacklist: (id) => `/customers/${id}/blacklist/`,
  activate: (id) => `/customers/${id}/activate/`,
  export: '/customers/export/',
  import: '/customers/import/',
  employment: (customerId) => `/customers/${customerId}/employment/`,
  updateEmployment: (customerId) => `/customers/${customerId}/employment/update/`,
  guarantors: (customerId) => `/customers/${customerId}/guarantors/`,
  createGuarantor: (customerId) => `/customers/${customerId}/guarantors/create/`,
  guarantorDetail: (id) => `/customers/guarantors/${id}/`,
  verifyGuarantor: (id) => `/customers/guarantors/${id}/verify/`,
})

function toFormData(payload = {}) {
  if (payload instanceof FormData) {
    return payload
  }

  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        form.append(key, item instanceof File ? item : String(item))
      })
      return
    }
    form.append(key, value instanceof File ? value : String(value))
  })
  return form
}

function parseResponse(response) {
  const data = response?.data
  if (data && typeof data === 'object') {
    if (data.success === true && data.data !== undefined) {
      return {
        success: true,
        data: data.data,
        pagination: data.pagination || null,
        message: data.message || null,
      }
    }
    return { success: true, data, pagination: null, message: data.message || null }
  }
  return { success: true, data, pagination: null, message: null }
}

export function normalizeCustomerEntity(payload) {
  if (!payload || typeof payload !== 'object') return payload
  if (payload.customer && typeof payload.customer === 'object') return payload.customer
  if (payload.data && typeof payload.data === 'object') return normalizeCustomerEntity(payload.data)
  return payload
}

function handleError(error) {
  const payload = error?.response?.data || {}
  const message =
    payload.detail ||
    payload.message ||
    (typeof payload === 'string' ? payload : null) ||
    error?.message ||
    'An error occurred'

  return {
    success: false,
    error: message,
    raw: payload,
    status: error?.response?.status || null,
  }
}

async function safeRequest(requestFn) {
  try {
    const response = await requestFn()
    return parseResponse(response)
  } catch (error) {
    console.error('customers service error', error)
    return handleError(error)
  }
}

export const getCustomers = async (params = {}) =>
  safeRequest(() => axios.get(CUSTOMER_ENDPOINTS.list, { params }))

export const getCustomer = async (id) =>
  safeRequest(() => axios.get(CUSTOMER_ENDPOINTS.detail(id)))

export const createCustomer = async (payload) =>
  safeRequest(() =>
    axios.post(CUSTOMER_ENDPOINTS.create, toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  )

export const updateCustomer = async (id, payload) =>
  safeRequest(() =>
    axios.put(CUSTOMER_ENDPOINTS.detail(id), toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  )

export const deleteCustomer = async (id) =>
  safeRequest(() => axios.delete(CUSTOMER_ENDPOINTS.detail(id)))

export const searchCustomers = async (query, type = 'basic', params = {}) =>
  safeRequest(() => axios.get(CUSTOMER_ENDPOINTS.search, { params: { q: query, type, ...params } }))

export const getCustomerStats = async () =>
  safeRequest(() => axios.get(CUSTOMER_ENDPOINTS.stats))

export const blacklistCustomer = async (id, reason = '') =>
  safeRequest(() => axios.post(CUSTOMER_ENDPOINTS.blacklist(id), { reason }))

export const activateCustomer = async (id) =>
  safeRequest(() => axios.post(CUSTOMER_ENDPOINTS.activate(id)))

export const exportCustomers = async (format = 'excel', filters = {}) => {
  try {
    const response = await axios.get(CUSTOMER_ENDPOINTS.export, {
      params: { format, ...filters },
      responseType: 'blob',
    })
    return {
      success: true,
      data: response.data,
      filename: response.headers['content-disposition'] || null,
      message: null,
    }
  } catch (error) {
    console.error('customers export error', error)
    return handleError(error)
  }
}

export const importCustomers = async (file) =>
  safeRequest(() => {
    const form = new FormData()
    form.append('file', file)
    return axios.post(CUSTOMER_ENDPOINTS.import, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  })

export const getEmployment = async (customerId) =>
  safeRequest(() => axios.get(CUSTOMER_ENDPOINTS.employment(customerId)))

export const updateEmployment = async (customerId, payload) =>
  safeRequest(() =>
    axios.put(CUSTOMER_ENDPOINTS.updateEmployment(customerId), toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  )

export const getGuarantors = async (customerId) =>
  safeRequest(() => axios.get(CUSTOMER_ENDPOINTS.guarantors(customerId)))

export const createGuarantor = async (customerId, payload) =>
  safeRequest(() =>
    axios.post(CUSTOMER_ENDPOINTS.createGuarantor(customerId), toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  )

export const getGuarantor = async (id) =>
  safeRequest(() => axios.get(CUSTOMER_ENDPOINTS.guarantorDetail(id)))

export const updateGuarantor = async (id, payload) =>
  safeRequest(() =>
    axios.put(CUSTOMER_ENDPOINTS.guarantorDetail(id), toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  )

export const deleteGuarantor = async (id) =>
  safeRequest(() => axios.delete(CUSTOMER_ENDPOINTS.guarantorDetail(id)))

export const verifyGuarantor = async (id, action, notes = '') =>
  safeRequest(() => axios.post(CUSTOMER_ENDPOINTS.verifyGuarantor(id), { action, notes }))

const customerAPI = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerStats,
  blacklistCustomer,
  activateCustomer,
  exportCustomers,
  importCustomers,
  getEmployment,
  updateEmployment,
  getGuarantors,
  createGuarantor,
  getGuarantor,
  updateGuarantor,
  deleteGuarantor,
  verifyGuarantor,
}

export default customerAPI
