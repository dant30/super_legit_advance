// frontend/src/lib/api/customers.ts
import axiosInstance from '@/lib/axios'

/* =====================================================
 * Core Types
 * ===================================================== */

export interface Customer {
  id: string
  customer_number: string
  first_name: string
  last_name: string
  middle_name?: string
  full_name: string
  email?: string
  phone_number: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  id_number: string
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'ALIEN_CARD'
  id_expiry_date?: string
  nationality: string
  physical_address: string
  postal_address?: string
  county: string
  sub_county: string
  ward?: string
  bank_name?: string
  bank_account_number?: string
  bank_branch?: string
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'DECEASED'
  credit_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  age: number
  is_active: boolean
  is_blacklisted: boolean
  total_loans: number
  active_loans: number
  total_loan_amount: number
  outstanding_balance: number
  loan_performance: number
  registration_date: string
  last_updated: string
  created_at: string
  updated_at: string
  notes?: string
  referred_by?: string
  user?: string
  created_by?: string
  updated_by?: string
}

export interface Employment {
  id: string
  customer: string
  employment_type: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED'
  sector: string
  occupation: string
  employer_name?: string
  employer_address?: string
  employer_phone?: string
  employer_email?: string
  job_title?: string
  department?: string
  employee_number?: string
  date_employed?: string
  years_of_service: number
  monthly_income: number
  other_income: number
  total_monthly_income: number
  payment_frequency: string
  next_pay_date?: string
  business_name?: string
  business_type?: string
  business_registration?: string
  business_start_date?: string
  number_of_employees: number
  is_verified: boolean
  verification_date?: string
  verification_method?: string
  verification_notes?: string
  employment_letter?: string
  pay_slips?: string
  business_permit?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Guarantor {
  id: string
  customer: string
  first_name: string
  middle_name?: string
  last_name: string
  full_name: string
  phone_number: string
  email?: string
  physical_address: string
  county: string
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE'
  id_number: string
  guarantor_type: 'PERSONAL' | 'CORPORATE' | 'INSTITUTIONAL'
  relationship: 'SPOUSE' | 'PARENT' | 'SIBLING' | 'FRIEND' | 'COLLEAGUE' | 'RELATIVE' | 'OTHER'
  occupation: string
  employer?: string
  monthly_income: number
  id_document?: string
  passport_photo?: string
  is_active: boolean
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  is_verified?: boolean
  verification_date?: string
  verification_notes?: string
  notes?: string
  created_at: string
  updated_at: string
}

/* =====================================================
 * API Response Types
 * ===================================================== */

export interface CustomerListResponse {
  results: Customer[]
  count: number
  next: string | null
  previous: string | null
}

export interface CustomerDetailResponse extends Customer {
  loan_statistics?: {
    total_loans: number
    active_loans: number
    total_borrowed: number
    total_outstanding: number
    total_repaid: number
  }
  guarantors?: Guarantor[]
  employment?: Employment
}

export interface CustomerStatsResponse {
  total_customers: number
  active_customers: number
  blacklisted_customers: number
  new_customers_today: number
  gender_distribution: Array<{ gender: string; count: number }>
  status_distribution: Array<{ status: string; count: number }>
  top_counties: Array<{ county: string; count: number }>
  monthly_registrations: Array<{ month: string; count: number }>
  loan_statistics: {
    customers_with_loans: number
    customers_with_active_loans: number
    customers_with_overdue_loans: number
  }
}

/* =====================================================
 * API Parameters
 * ===================================================== */

export interface CustomerListParams {
  page?: number
  page_size?: number
  search?: string
  status?: string
  gender?: string
  marital_status?: string
  county?: string
  risk_level?: string
  active?: boolean | string
  blacklisted?: boolean | string
  has_loans?: boolean | string
  start_date?: string
  end_date?: string
  ordering?: string
}

export interface CustomerCreateData {
  first_name: string
  last_name: string
  middle_name?: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'ALIEN_CARD'
  id_number: string
  id_expiry_date?: string
  nationality?: string
  phone_number: string
  confirm_phone_number?: string
  email?: string
  confirm_email?: string
  postal_address?: string
  physical_address: string
  county: string
  sub_county: string
  ward?: string
  bank_name?: string
  bank_account_number?: string
  bank_branch?: string
  notes?: string
  referred_by?: string
  create_user_account?: boolean
  user_password?: string
  id_document?: File
  passport_photo?: File
  signature?: File
}

export interface CustomerUpdateData {
  first_name?: string
  last_name?: string
  middle_name?: string
  date_of_birth?: string
  gender?: 'M' | 'F' | 'O'
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'
  id_type?: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'ALIEN_CARD'
  id_expiry_date?: string
  nationality?: string
  phone_number?: string
  email?: string
  postal_address?: string
  physical_address?: string
  county?: string
  sub_county?: string
  ward?: string
  bank_name?: string
  bank_account_number?: string
  bank_branch?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'DECEASED'
  credit_score?: number
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH'
  notes?: string
  referred_by?: string
  id_document?: File
  passport_photo?: File
  signature?: File
  current_password?: string
}

export interface EmploymentCreateData extends Partial<Employment> {}

export interface GuarantorCreateData {
  first_name: string
  middle_name?: string
  last_name: string
  phone_number: string
  confirm_phone_number?: string
  email?: string
  physical_address: string
  county: string
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE'
  id_number: string
  guarantor_type: 'PERSONAL' | 'CORPORATE' | 'INSTITUTIONAL'
  relationship: 'SPOUSE' | 'PARENT' | 'SIBLING' | 'FRIEND' | 'COLLEAGUE' | 'RELATIVE' | 'OTHER'
  occupation: string
  employer?: string
  monthly_income: number
  id_document?: File
  passport_photo?: File
  notes?: string
}

/* =====================================================
 * API Class
 * ===================================================== */

class CustomerAPI {
  private baseURL = '/customers'

  /* ===== CUSTOMER ENDPOINTS ===== */

  async getCustomers(params?: CustomerListParams): Promise<CustomerListResponse> {
    try {
      const response = await axiosInstance.get<any>(this.baseURL, {
        params,
      })
      
      // ✅ FIXED: Handle new response format with { success, data, pagination }
      if (response.data.success && response.data.data) {
        return {
          results: response.data.data,
          count: response.data.pagination.total,
          next: response.data.pagination.next || null,
          previous: response.data.pagination.previous || null,
        }
      }
      
      // Fallback for old format
      return response.data
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw error
    }
  }

  async getCustomer(id: string): Promise<CustomerDetailResponse> {
    try {
      const response = await axiosInstance.get<any>(`${this.baseURL}/${id}/`)
      
      // Handle response format
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw error
    }
  }

  async createCustomer(data: CustomerCreateData): Promise<Customer> {
    try {
      const formData = new FormData()

      // Append all fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await axiosInstance.post<Customer>(`${this.baseURL}/create/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  async updateCustomer(id: string, data: CustomerUpdateData): Promise<Customer> {
    try {
      const formData = new FormData()

      // Append all fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await axiosInstance.put<Customer>(`${this.baseURL}/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseURL}/${id}/`)
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }

  async searchCustomers(query: string, searchType?: string): Promise<Customer[]> {
    try {
      const response = await axiosInstance.get<{ results: Customer[] }>(
        `${this.baseURL}/search/`,
        {
          params: {
            q: query,
            type: searchType || 'basic',
          },
        }
      )
      return response.data.results
    } catch (error) {
      console.error('Error searching customers:', error)
      throw error
    }
  }

  async getCustomerStats(): Promise<CustomerStatsResponse> {
    try {
      const response = await axiosInstance.get<CustomerStatsResponse>(`${this.baseURL}/stats/`)
      return response.data
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      throw error
    }
  }

  async blacklistCustomer(id: string, reason: string): Promise<Customer> {
    try {
      const response = await axiosInstance.post<Customer>(
        `${this.baseURL}/${id}/blacklist/`,
        { reason }
      )
      return response.data
    } catch (error) {
      console.error('Error blacklisting customer:', error)
      throw error
    }
  }

  async activateCustomer(id: string): Promise<Customer> {
    try {
      const response = await axiosInstance.post<Customer>(`${this.baseURL}/${id}/activate/`)
      return response.data
    } catch (error) {
      console.error('Error activating customer:', error)
      throw error
    }
  }

  async exportCustomers(format: 'excel' | 'csv', filters?: any): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/export/`, {
        params: {
          format,
          ...filters,
        },
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('Error exporting customers:', error)
      throw error
    }
  }

  async importCustomers(file: File): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosInstance.post(`${this.baseURL}/import/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error importing customers:', error)
      throw error
    }
  }

  /* ===== EMPLOYMENT ENDPOINTS ===== */

  async getEmployment(customerId: string): Promise<Employment> {
    try {
      const response = await axiosInstance.get<Employment>(
        `${this.baseURL}/${customerId}/employment/`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching employment:', error)
      throw error
    }
  }

  async updateEmployment(customerId: string, data: EmploymentCreateData): Promise<Employment> {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await axiosInstance.put<Employment>(
        `${this.baseURL}/${customerId}/employment/update/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error updating employment:', error)
      throw error
    }
  }

  /* ===== GUARANTOR ENDPOINTS ===== */

  async getGuarantors(customerId: string): Promise<Guarantor[]> {
    try {
      const response = await axiosInstance.get<{ results: Guarantor[] }>(
        `${this.baseURL}/${customerId}/guarantors/`
      )
      return response.data.results
    } catch (error) {
      console.error('Error fetching guarantors:', error)
      throw error
    }
  }

  async createGuarantor(customerId: string, data: GuarantorCreateData): Promise<Guarantor> {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await axiosInstance.post<Guarantor>(
        `${this.baseURL}/${customerId}/guarantors/create/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating guarantor:', error)
      throw error
    }
  }

  async getGuarantor(id: string): Promise<Guarantor> {
    try {
      const response = await axiosInstance.get<Guarantor>(`${this.baseURL}/guarantors/${id}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching guarantor:', error)
      throw error
    }
  }

  async updateGuarantor(id: string, data: Partial<GuarantorCreateData>): Promise<Guarantor> {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await axiosInstance.put<Guarantor>(
        `${this.baseURL}/guarantors/${id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error updating guarantor:', error)
      throw error
    }
  }

  async deleteGuarantor(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseURL}/guarantors/${id}/`)
    } catch (error) {
      console.error('Error deleting guarantor:', error)
      throw error
    }
  }

  async verifyGuarantor(
    id: string,
    action: 'verify' | 'reject',
    notes: string
  ): Promise<Guarantor> {
    try {
      const response = await axiosInstance.post<Guarantor>(
        `${this.baseURL}/guarantors/${id}/verify/`,
        {
          action,
          notes,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error verifying guarantor:', error)
      throw error
    }
  }
}

export const customerAPI = new CustomerAPI()
export type { CustomerAPI }