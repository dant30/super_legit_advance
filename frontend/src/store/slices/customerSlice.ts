// frontend/src/store/customerSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerAPI } from '@/lib/api/customers'

interface CustomerState {
  customers: any[]
  selectedCustomer: any | null
  loading: boolean
  error: string | null
  filters: any
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  filters: {},
}

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomers(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch customers')
    }
  }
)

export const fetchCustomer = createAsyncThunk(
  'customers/fetchCustomer',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomer(String(id))
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch customer')
    }
  }
)

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await customerAPI.createCustomer(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create customer')
    }
  }
)

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload.results || []
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch customer by ID
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.selectedCustomer = action.payload
      })

      // Create customer
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload)
      })
  },
})

export default customerSlice.reducer