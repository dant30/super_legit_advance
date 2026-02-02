// frontend/src/api/customers.js
import axios from './axios'

// Base URL for customer endpoints
const CUSTOMER_BASE_URL = '/customers'

// =====================================================
// API Functions
// =====================================================

// Get all customers with filters
export const getCustomers = async (params = {}) => {
  try {
    const response = await axios.get(CUSTOMER_BASE_URL, { params })
    // Handle both response formats
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      }
    }
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch customers'
    }
  }
}

// Get single customer by ID
export const getCustomer = async (id) => {
  try {
    const response = await axios.get(`${CUSTOMER_BASE_URL}/${id}/`)
    if (response.data.success && response.data.data) {
      return { success: true, data: response.data.data }
    }
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching customer:', error)
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch customer'
    }
  }
}

// Create new customer
export const createCustomer = async (customerData) => {
  try {
    const formData = new FormData()
    
    // Append all fields to formData
    Object.entries(customerData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    const response = await axios.post(`${CUSTOMER_BASE_URL}/create/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error creating customer:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to create customer'
    }
  }
}

// Update customer
export const updateCustomer = async (id, customerData) => {
  try {
    const formData = new FormData()
    
    Object.entries(customerData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    const response = await axios.put(`${CUSTOMER_BASE_URL}/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating customer:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to update customer'
    }
  }
}

// Delete customer
export const deleteCustomer = async (id) => {
  try {
    await axios.delete(`${CUSTOMER_BASE_URL}/${id}/`)
    return { success: true, message: 'Customer deleted successfully' }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to delete customer'
    }
  }
}

// Search customers
export const searchCustomers = async (query, searchType = 'basic') => {
  try {
    const response = await axios.get(`${CUSTOMER_BASE_URL}/search/`, {
      params: { q: query, type: searchType }
    })
    return { success: true, data: response.data.results || response.data }
  } catch (error) {
    console.error('Error searching customers:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to search customers'
    }
  }
}

// Get customer statistics
export const getCustomerStats = async () => {
  try {
    const response = await axios.get(`${CUSTOMER_BASE_URL}/stats/`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching customer stats:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to fetch customer statistics'
    }
  }
}

// Blacklist customer
export const blacklistCustomer = async (id, reason) => {
  try {
    const response = await axios.post(`${CUSTOMER_BASE_URL}/${id}/blacklist/`, { reason })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error blacklisting customer:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to blacklist customer'
    }
  }
}

// Activate customer
export const activateCustomer = async (id) => {
  try {
    const response = await axios.post(`${CUSTOMER_BASE_URL}/${id}/activate/`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error activating customer:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to activate customer'
    }
  }
}

// Export customers
export const exportCustomers = async (format = 'excel', filters = {}) => {
  try {
    const response = await axios.get(`${CUSTOMER_BASE_URL}/export/`, {
      params: { format, ...filters },
      responseType: 'blob'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error exporting customers:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to export customers'
    }
  }
}

// Import customers
export const importCustomers = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post(`${CUSTOMER_BASE_URL}/import/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error importing customers:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to import customers'
    }
  }
}

// =====================================================
// Employment Endpoints
// =====================================================

// Get employment info
export const getEmployment = async (customerId) => {
  try {
    const response = await axios.get(`${CUSTOMER_BASE_URL}/${customerId}/employment/`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching employment:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to fetch employment'
    }
  }
}

// Update employment
export const updateEmployment = async (customerId, employmentData) => {
  try {
    const formData = new FormData()
    
    Object.entries(employmentData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    const response = await axios.put(
      `${CUSTOMER_BASE_URL}/${customerId}/employment/update/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating employment:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to update employment'
    }
  }
}

// =====================================================
// Guarantor Endpoints
// =====================================================

// Get guarantors
export const getGuarantors = async (customerId) => {
  try {
    const response = await axios.get(`${CUSTOMER_BASE_URL}/${customerId}/guarantors/`)
    return { success: true, data: response.data.results || response.data }
  } catch (error) {
    console.error('Error fetching guarantors:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to fetch guarantors'
    }
  }
}

// Create guarantor
export const createGuarantor = async (customerId, guarantorData) => {
  try {
    const formData = new FormData()
    
    Object.entries(guarantorData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    const response = await axios.post(
      `${CUSTOMER_BASE_URL}/${customerId}/guarantors/create/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error creating guarantor:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to create guarantor'
    }
  }
}

// Get single guarantor
export const getGuarantor = async (id) => {
  try {
    const response = await axios.get(`${CUSTOMER_BASE_URL}/guarantors/${id}/`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching guarantor:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to fetch guarantor'
    }
  }
}

// Update guarantor
export const updateGuarantor = async (id, guarantorData) => {
  try {
    const formData = new FormData()
    
    Object.entries(guarantorData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    const response = await axios.put(
      `${CUSTOMER_BASE_URL}/guarantors/${id}/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating guarantor:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to update guarantor'
    }
  }
}

// Delete guarantor
export const deleteGuarantor = async (id) => {
  try {
    await axios.delete(`${CUSTOMER_BASE_URL}/guarantors/${id}/`)
    return { success: true, message: 'Guarantor deleted successfully' }
  } catch (error) {
    console.error('Error deleting guarantor:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to delete guarantor'
    }
  }
}

// Verify guarantor
export const verifyGuarantor = async (id, action, notes) => {
  try {
    const response = await axios.post(`${CUSTOMER_BASE_URL}/guarantors/${id}/verify/`, {
      action,
      notes
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error verifying guarantor:', error)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to verify guarantor'
    }
  }
}

// =====================================================
// Export all functions
// =====================================================

const customerAPI = {
  // Customer methods
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
  
  // Employment methods
  getEmployment,
  updateEmployment,
  
  // Guarantor methods
  getGuarantors,
  createGuarantor,
  getGuarantor,
  updateGuarantor,
  deleteGuarantor,
  verifyGuarantor
}

export default customerAPI