// frontend/src/store/slices/customerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
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

/* =====================================================
 * State Interface
 * ===================================================== */

interface CustomerState {
  // List state
  customers: Customer[]
  customersLoading: boolean
  customersError: string | null
  customersPagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }

  // Detail state
  selectedCustomer: CustomerDetailResponse | null
  selectedCustomerLoading: boolean
  selectedCustomerError: string | null

  // Stats state
  stats: CustomerStatsResponse | null
  statsLoading: boolean
  statsError: string | null

  // Employment state
  employment: Employment | null
  employmentLoading: boolean
  employmentError: string | null

  // Guarantors state
  guarantors: Guarantor[]
  selectedGuarantor: Guarantor | null
  guarantorsLoading: boolean
  guarantorsError: string | null

  // Search state
  searchResults: Customer[]
  searchLoading: boolean
  searchError: string | null

  // Filters
  filters: {
    search?: string
    status?: string
    gender?: string
    county?: string
    risk_level?: string
  }
}

/* =====================================================
 * Initial State
 * ===================================================== */

const initialState: CustomerState = {
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
}

/* =====================================================
 * Async Thunks
 * ===================================================== */

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: CustomerListParams, { rejectWithValue }) => {
    try {
      return await customerAPI.getCustomers(params)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch customers')
    }
  }
)

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await customerAPI.getCustomer(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch customer')
    }
  }
)

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (data: CustomerCreateData, { rejectWithValue }) => {
    try {
      return await customerAPI.createCustomer(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create customer')
    }
  }
)

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }: { id: string; data: CustomerUpdateData }, { rejectWithValue }) => {
    try {
      return await customerAPI.updateCustomer(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update customer')
    }
  }
)

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await customerAPI.deleteCustomer(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete customer')
    }
  }
)

export const searchCustomers = createAsyncThunk(
  'customers/searchCustomers',
  async ({ query, searchType }: { query: string; searchType?: string }, { rejectWithValue }) => {
    try {
      return await customerAPI.searchCustomers(query, searchType)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to search customers')
    }
  }
)

export const fetchCustomerStats = createAsyncThunk(
  'customers/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await customerAPI.getCustomerStats()
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch customer stats')
    }
  }
)

export const blacklistCustomer = createAsyncThunk(
  'customers/blacklistCustomer',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      return await customerAPI.blacklistCustomer(id, reason)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to blacklist customer')
    }
  }
)

export const activateCustomer = createAsyncThunk(
  'customers/activateCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      return await customerAPI.activateCustomer(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to activate customer')
    }
  }
)

export const fetchEmployment = createAsyncThunk(
  'customers/fetchEmployment',
  async (customerId: string, { rejectWithValue }) => {
    try {
      return await customerAPI.getEmployment(customerId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch employment')
    }
  }
)

export const updateEmployment = createAsyncThunk(
  'customers/updateEmployment',
  async (
    { customerId, data }: { customerId: string; data: EmploymentCreateData },
    { rejectWithValue }
  ) => {
    try {
      return await customerAPI.updateEmployment(customerId, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update employment')
    }
  }
)

export const fetchGuarantors = createAsyncThunk(
  'customers/fetchGuarantors',
  async (customerId: string, { rejectWithValue }) => {
    try {
      return await customerAPI.getGuarantors(customerId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch guarantors')
    }
  }
)

export const createGuarantor = createAsyncThunk(
  'customers/createGuarantor',
  async (
    { customerId, data }: { customerId: string; data: GuarantorCreateData },
    { rejectWithValue }
  ) => {
    try {
      return await customerAPI.createGuarantor(customerId, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create guarantor')
    }
  }
)

export const fetchGuarantorById = createAsyncThunk(
  'customers/fetchGuarantorById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await customerAPI.getGuarantor(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch guarantor')
    }
  }
)

export const updateGuarantor = createAsyncThunk(
  'customers/updateGuarantor',
  async ({ id, data }: { id: string; data: Partial<GuarantorCreateData> }, { rejectWithValue }) => {
    try {
      return await customerAPI.updateGuarantor(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update guarantor')
    }
  }
)

export const deleteGuarantor = createAsyncThunk(
  'customers/deleteGuarantor',
  async (id: string, { rejectWithValue }) => {
    try {
      await customerAPI.deleteGuarantor(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete guarantor')
    }
  }
)

export const verifyGuarantor = createAsyncThunk(
  'customers/verifyGuarantor',
  async (
    { id, action, notes }: { id: string; action: 'verify' | 'reject'; notes: string },
    { rejectWithValue }
  ) => {
    try {
      return await customerAPI.verifyGuarantor(id, action, notes)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to verify guarantor')
    }
  }
)

/* =====================================================
 * Slice
 * ===================================================== */

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomersError: (state) => {
      state.customersError = null
    },
    clearSelectedCustomerError: (state) => {
      state.selectedCustomerError = null
    },
    clearStatsError: (state) => {
      state.statsError = null
    },
    clearEmploymentError: (state) => {
      state.employmentError = null
    },
    clearGuarantorsError: (state) => {
      state.guarantorsError = null
    },
    clearSearchError: (state) => {
      state.searchError = null
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
    },
    clearSelectedGuarantor: (state) => {
      state.selectedGuarantor = null
    },
    setFilters: (state, action: PayloadAction<Partial<CustomerState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setCustomerPage: (state, action: PayloadAction<number>) => {
      state.customersPagination.page = action.payload
    },
  },
  extraReducers: (builder) => {
    // fetchCustomers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customersLoading = false
        state.customers = action.payload.results
        state.customersPagination = {
          page: 1,
          page_size: 20,
          total: action.payload.count,
          total_pages: Math.ceil(action.payload.count / 20),
        }
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = action.payload as string
      })

    // fetchCustomerById
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.selectedCustomerLoading = true
        state.selectedCustomerError = null
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.selectedCustomerLoading = false
        state.selectedCustomer = action.payload
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.selectedCustomerLoading = false
        state.selectedCustomerError = action.payload as string
      })

    // createCustomer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customersLoading = false
        state.customers.unshift(action.payload)
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = action.payload as string
      })

    // updateCustomer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.customersLoading = false
        const index = state.customers.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = { ...state.selectedCustomer, ...action.payload }
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = action.payload as string
      })

    // deleteCustomer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customersLoading = false
        state.customers = state.customers.filter((c) => c.id !== action.payload)
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = action.payload as string
      })

    // searchCustomers
    builder
      .addCase(searchCustomers.pending, (state) => {
        state.searchLoading = true
        state.searchError = null
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.searchLoading = false
        state.searchError = action.payload as string
      })

    // fetchCustomerStats
    builder
      .addCase(fetchCustomerStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload as string
      })

    // blacklistCustomer
    builder
      .addCase(blacklistCustomer.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
      })
      .addCase(blacklistCustomer.fulfilled, (state, action) => {
        state.customersLoading = false
        const index = state.customers.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = { ...state.selectedCustomer, ...action.payload }
        }
      })
      .addCase(blacklistCustomer.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = action.payload as string
      })

    // activateCustomer
    builder
      .addCase(activateCustomer.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
      })
      .addCase(activateCustomer.fulfilled, (state, action) => {
        state.customersLoading = false
        const index = state.customers.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = { ...state.selectedCustomer, ...action.payload }
        }
      })
      .addCase(activateCustomer.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = action.payload as string
      })

    // fetchEmployment
    builder
      .addCase(fetchEmployment.pending, (state) => {
        state.employmentLoading = true
        state.employmentError = null
      })
      .addCase(fetchEmployment.fulfilled, (state, action) => {
        state.employmentLoading = false
        state.employment = action.payload
      })
      .addCase(fetchEmployment.rejected, (state, action) => {
        state.employmentLoading = false
        state.employmentError = action.payload as string
      })

    // updateEmployment
    builder
      .addCase(updateEmployment.pending, (state) => {
        state.employmentLoading = true
        state.employmentError = null
      })
      .addCase(updateEmployment.fulfilled, (state, action) => {
        state.employmentLoading = false
        state.employment = action.payload
        if (state.selectedCustomer) {
          state.selectedCustomer.employment = action.payload
        }
      })
      .addCase(updateEmployment.rejected, (state, action) => {
        state.employmentLoading = false
        state.employmentError = action.payload as string
      })

    // fetchGuarantors
    builder
      .addCase(fetchGuarantors.pending, (state) => {
        state.guarantorsLoading = true
        state.guarantorsError = null
      })
      .addCase(fetchGuarantors.fulfilled, (state, action) => {
        state.guarantorsLoading = false
        state.guarantors = action.payload
      })
      .addCase(fetchGuarantors.rejected, (state, action) => {
        state.guarantorsLoading = false
        state.guarantorsError = action.payload as string
      })

    // createGuarantor
    builder
      .addCase(createGuarantor.pending, (state) => {
        state.guarantorsLoading = true
        state.guarantorsError = null
      })
      .addCase(createGuarantor.fulfilled, (state, action) => {
        state.guarantorsLoading = false
        state.guarantors.unshift(action.payload)
      })
      .addCase(createGuarantor.rejected, (state, action) => {
        state.guarantorsLoading = false
        state.guarantorsError = action.payload as string
      })

    // fetchGuarantorById
    builder
      .addCase(fetchGuarantorById.pending, (state) => {
        state.guarantorsLoading = true
        state.guarantorsError = null
      })
      .addCase(fetchGuarantorById.fulfilled, (state, action) => {
        state.guarantorsLoading = false
        state.selectedGuarantor = action.payload
      })
      .addCase(fetchGuarantorById.rejected, (state, action) => {
        state.guarantorsLoading = false
        state.guarantorsError = action.payload as string
      })

    // updateGuarantor
    builder
      .addCase(updateGuarantor.pending, (state) => {
        state.guarantorsLoading = true
        state.guarantorsError = null
      })
      .addCase(updateGuarantor.fulfilled, (state, action) => {
        state.guarantorsLoading = false
        const index = state.guarantors.findIndex((g) => g.id === action.payload.id)
        if (index !== -1) {
          state.guarantors[index] = action.payload
        }
        if (state.selectedGuarantor?.id === action.payload.id) {
          state.selectedGuarantor = action.payload
        }
      })
      .addCase(updateGuarantor.rejected, (state, action) => {
        state.guarantorsLoading = false
        state.guarantorsError = action.payload as string
      })

    // deleteGuarantor
    builder
      .addCase(deleteGuarantor.pending, (state) => {
        state.guarantorsLoading = true
        state.guarantorsError = null
      })
      .addCase(deleteGuarantor.fulfilled, (state, action) => {
        state.guarantorsLoading = false
        state.guarantors = state.guarantors.filter((g) => g.id !== action.payload)
        if (state.selectedGuarantor?.id === action.payload) {
          state.selectedGuarantor = null
        }
      })
      .addCase(deleteGuarantor.rejected, (state, action) => {
        state.guarantorsLoading = false
        state.guarantorsError = action.payload as string
      })

    // verifyGuarantor
    builder
      .addCase(verifyGuarantor.pending, (state) => {
        state.guarantorsLoading = true
        state.guarantorsError = null
      })
      .addCase(verifyGuarantor.fulfilled, (state, action) => {
        state.guarantorsLoading = false
        const index = state.guarantors.findIndex((g) => g.id === action.payload.id)
        if (index !== -1) {
          state.guarantors[index] = action.payload
        }
        if (state.selectedGuarantor?.id === action.payload.id) {
          state.selectedGuarantor = action.payload
        }
      })
      .addCase(verifyGuarantor.rejected, (state, action) => {
        state.guarantorsLoading = false
        state.guarantorsError = action.payload as string
      })
  },
})

export const {
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
} = customerSlice.actions

export default customerSlice.reducer