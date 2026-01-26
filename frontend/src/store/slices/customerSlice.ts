// frontend/src/store/customerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { customerAPI } from '@/lib/api/customers'
import type {
  Customer,
  CustomerListResponse,
  CustomerDetailResponse,
  CustomerStatsResponse,
  CustomerListParams,
  CustomerCreateData,
  CustomerUpdateData,
  CustomerFilters
} from '@/types/customers'

interface CustomerState {
  customers: Customer[]
  selectedCustomer: CustomerDetailResponse | null
  isLoading: boolean
  error: string | null
  filters: CustomerFilters
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
  stats: CustomerStatsResponse | null
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  },
  stats: null,
}

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params?: CustomerListParams, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomers(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to fetch customers'
      )
    }
  }
)

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomer(id)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to fetch customer'
      )
    }
  }
)

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (data: CustomerCreateData, { rejectWithValue }) => {
    try {
      const response = await customerAPI.createCustomer(data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to create customer'
      )
    }
  }
)

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }: { id: string; data: CustomerUpdateData }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.updateCustomer(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to update customer'
      )
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
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to delete customer'
      )
    }
  }
)

export const blacklistCustomer = createAsyncThunk(
  'customers/blacklistCustomer',
  async (
    { id, reason }: { id: string; reason: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await customerAPI.blacklistCustomer(id, reason)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to blacklist customer'
      )
    }
  }
)

export const activateCustomer = createAsyncThunk(
  'customers/activateCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customerAPI.activateCustomer(id)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to activate customer'
      )
    }
  }
)

export const fetchCustomerStats = createAsyncThunk(
  'customers/fetchCustomerStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomerStats()
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to fetch customer statistics'
      )
    }
  }
)

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
    },
    setFilters: (state, action: PayloadAction<CustomerFilters>) => {
      state.filters = action.payload
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    clearStats: (state) => {
      state.stats = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = action.payload.results || []
        if (action.payload.count !== undefined) {
          state.pagination.total = action.payload.count
          state.pagination.total_pages = Math.ceil(
            action.payload.count / state.pagination.page_size
          )
        }
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedCustomer = action.payload
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers.unshift(action.payload)
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.customers.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = {
            ...state.selectedCustomer,
            ...action.payload,
          }
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = state.customers.filter((c) => c.id !== action.payload)
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Blacklist customer
      .addCase(blacklistCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(blacklistCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.customers.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = {
            ...state.selectedCustomer,
            ...action.payload,
          }
        }
      })
      .addCase(blacklistCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Activate customer
      .addCase(activateCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(activateCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.customers.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = {
            ...state.selectedCustomer,
            ...action.payload,
          }
        }
      })
      .addCase(activateCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Fetch customer stats
      .addCase(fetchCustomerStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  clearSelectedCustomer,
  setFilters,
  setPage,
  clearStats,
} = customerSlice.actions

export default customerSlice.reducer