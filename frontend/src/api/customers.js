// frontend/src/api/customers.js
import axios from './axios'

const BASE = '/customers'

const parseResponse = (response) => {
  // Standardize response shape from backend
  const data = response.data
  if (data && typeof data === 'object') {
    // DRF style: { success, data, pagination, message } or raw list/object
    if (data.success === true && data.data !== undefined) {
      return { success: true, data: data.data, pagination: data.pagination || null, message: data.message || null }
    }
    // If backend returns list/object directly
    return { success: true, data: data, pagination: null }
  }
  return { success: true, data: data }
}

const handleError = (error) => {
  const payload = error?.response?.data || {}
  const message = payload.detail || payload.message || (typeof payload === 'string' ? payload : null) || error.message || 'An error occurred'
  return { success: false, error: message, raw: payload, status: error?.response?.status || null }
}

// ====== Customers ======
export const getCustomers = async (params = {}) => {
  try {
    const res = await axios.get(`${BASE}/`, { params })
    return parseResponse(res)
  } catch (err) {
    console.error('getCustomers error', err)
    return handleError(err)
  }
}

export const getCustomer = async (id) => {
  try {
    const res = await axios.get(`${BASE}/${id}/`)
    return parseResponse(res)
  } catch (err) {
    console.error('getCustomer error', err)
    return handleError(err)
  }
}

export const createCustomer = async (payload) => {
  try {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) {
        v.forEach(item => form.append(k, item))
      } else {
        form.append(k, v instanceof File ? v : String(v))
      }
    })
    const res = await axios.post(`${BASE}/create/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return parseResponse(res)
  } catch (err) {
    console.error('createCustomer error', err)
    return handleError(err)
  }
}

export const updateCustomer = async (id, payload) => {
  try {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) {
        v.forEach(item => form.append(k, item))
      } else {
        form.append(k, v instanceof File ? v : String(v))
      }
    })
    const res = await axios.put(`${BASE}/${id}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return parseResponse(res)
  } catch (err) {
    console.error('updateCustomer error', err)
    return handleError(err)
  }
}

export const deleteCustomer = async (id) => {
  try {
    const res = await axios.delete(`${BASE}/${id}/`)
    return parseResponse(res)
  } catch (err) {
    console.error('deleteCustomer error', err)
    return handleError(err)
  }
}

export const searchCustomers = async (query, type = 'basic', params = {}) => {
  try {
    const res = await axios.get(`${BASE}/search/`, { params: { q: query, type, ...params } })
    return parseResponse(res)
  } catch (err) {
    console.error('searchCustomers error', err)
    return handleError(err)
  }
}

export const getCustomerStats = async () => {
  try {
    const res = await axios.get(`${BASE}/stats/`)
    return parseResponse(res)
  } catch (err) {
    console.error('getCustomerStats error', err)
    return handleError(err)
  }
}

export const blacklistCustomer = async (id, reason = '') => {
  try {
    const res = await axios.post(`${BASE}/${id}/blacklist/`, { reason })
    return parseResponse(res)
  } catch (err) {
    console.error('blacklistCustomer error', err)
    return handleError(err)
  }
}

export const activateCustomer = async (id) => {
  try {
    const res = await axios.post(`${BASE}/${id}/activate/`)
    return parseResponse(res)
  } catch (err) {
    console.error('activateCustomer error', err)
    return handleError(err)
  }
}

export const exportCustomers = async (format = 'excel', filters = {}) => {
  try {
    const res = await axios.get(`${BASE}/export/`, {
      params: { format, ...filters },
      responseType: 'blob',
    })
    return { success: true, data: res.data, filename: res.headers['content-disposition'] || null }
  } catch (err) {
    console.error('exportCustomers error', err)
    return handleError(err)
  }
}

export const importCustomers = async (file) => {
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await axios.post(`${BASE}/import/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return parseResponse(res)
  } catch (err) {
    console.error('importCustomers error', err)
    return handleError(err)
  }
}

// ====== Employment ======
export const getEmployment = async (customerId) => {
  try {
    const res = await axios.get(`${BASE}/${customerId}/employment/`)
    return parseResponse(res)
  } catch (err) {
    console.error('getEmployment error', err)
    return handleError(err)
  }
}

export const updateEmployment = async (customerId, payload) => {
  try {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      form.append(k, v instanceof File ? v : String(v))
    })
    const res = await axios.put(`${BASE}/${customerId}/employment/update/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return parseResponse(res)
  } catch (err) {
    console.error('updateEmployment error', err)
    return handleError(err)
  }
}

// ====== Guarantors ======
export const getGuarantors = async (customerId) => {
  try {
    const res = await axios.get(`${BASE}/${customerId}/guarantors/`)
    return parseResponse(res)
  } catch (err) {
    console.error('getGuarantors error', err)
    return handleError(err)
  }
}

export const createGuarantor = async (customerId, payload) => {
  try {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      form.append(k, v instanceof File ? v : String(v))
    })
    const res = await axios.post(`${BASE}/${customerId}/guarantors/create/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return parseResponse(res)
  } catch (err) {
    console.error('createGuarantor error', err)
    return handleError(err)
  }
}

export const getGuarantor = async (id) => {
  try {
    const res = await axios.get(`${BASE}/guarantors/${id}/`)
    return parseResponse(res)
  } catch (err) {
    console.error('getGuarantor error', err)
    return handleError(err)
  }
}

export const updateGuarantor = async (id, payload) => {
  try {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      form.append(k, v instanceof File ? v : String(v))
    })
    const res = await axios.put(`${BASE}/guarantors/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return parseResponse(res)
  } catch (err) {
    console.error('updateGuarantor error', err)
    return handleError(err)
  }
}

export const deleteGuarantor = async (id) => {
  try {
    const res = await axios.delete(`${BASE}/guarantors/${id}/`)
    return parseResponse(res)
  } catch (err) {
    console.error('deleteGuarantor error', err)
    return handleError(err)
  }
}

export const verifyGuarantor = async (id, action, notes = '') => {
  try {
    const res = await axios.post(`${BASE}/guarantors/${id}/verify/`, { action, notes })
    return parseResponse(res)
  } catch (err) {
    console.error('verifyGuarantor error', err)
    return handleError(err)
  }
}

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