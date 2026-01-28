// frontend/src/store/customerSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerAPI } from '@/lib/api/customers'

interface CustomerState {
  customers: any[]
  selectedCustomer: any | null
  loading: boolean
  error: string | null
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
}

// ✓ FIXED: Move required params before optional ones
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: any) => {
    return customerAPI.getCustomers(params)
  }
)

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload
        state.loading = false
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch customers'
        state.loading = false
      })
  },
})

export default customerSlice.reducer