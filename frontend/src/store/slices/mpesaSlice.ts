// frontend/src/store/slices/mpesaSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mpesaAPI } from '@/lib/api/mpesa'
import {
  MpesaPayment,
  MpesaTransaction,
  PaymentSummary,
  PaginatedResponse,
  PaymentHistoryParams,
  TransactionListParams,
  STKPushRequest
} from '@/types/mpesa'

/**
 * Mpesa Redux State Interface
 */
interface MpesaState {
  payments: {
    data: PaginatedResponse<MpesaPayment> | null
    loading: boolean
    error: string | null
  }
  transactions: {
    data: PaginatedResponse<MpesaTransaction> | null
    loading: boolean
    error: string | null
  }
  summary: {
    data: PaymentSummary | null
    loading: boolean
    error: string | null
  }
  currentPayment: {
    data: MpesaPayment | null
    loading: boolean
    error: string | null
  }
  currentTransaction: {
    data: MpesaTransaction | null
    loading: boolean
    error: string | null
  }
  stkPush: {
    loading: boolean
    error: string | null
    success: boolean
    checkoutRequestId: string | null
    paymentReference: string | null
    paymentId: number | null
  }
}

/**
 * Initial State
 */
const initialState: MpesaState = {
  payments: {
    data: null,
    loading: false,
    error: null
  },
  transactions: {
    data: null,
    loading: false,
    error: null
  },
  summary: {
    data: null,
    loading: false,
    error: null
  },
  currentPayment: {
    data: null,
    loading: false,
    error: null
  },
  currentTransaction: {
    data: null,
    loading: false,
    error: null
  },
  stkPush: {
    loading: false,
    error: null,
    success: false,
    checkoutRequestId: null,
    paymentReference: null,
    paymentId: null
  }
}

/**
 * Async Thunks
 */

/**
 * Initiate STK Push payment
 */
export const initiateSTKPush = createAsyncThunk(
  'mpesa/initiateSTKPush',
  async (data: STKPushRequest, { rejectWithValue }) => {
    try {
      const response = await mpesaAPI.initiateSTKPush(data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to initiate payment'
      )
    }
  }
)

/**
 * Fetch payment history
 */
export const fetchPaymentHistory = createAsyncThunk(
  'mpesa/fetchPaymentHistory',
  async (params?: PaymentHistoryParams, { rejectWithValue } = {} as any) => {
    try {
      const response = await mpesaAPI.getPaymentHistory(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch payment history'
      )
    }
  }
)

/**
 * Fetch transactions
 */
export const fetchTransactions = createAsyncThunk(
  'mpesa/fetchTransactions',
  async (params?: TransactionListParams, { rejectWithValue } = {} as any) => {
    try {
      const response = await mpesaAPI.getTransactions(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch transactions'
      )
    }
  }
)

/**
 * Fetch payment summary
 */
export const fetchPaymentSummary = createAsyncThunk(
  'mpesa/fetchPaymentSummary',
  async (days?: number, { rejectWithValue } = {} as any) => {
    try {
      const response = await mpesaAPI.getPaymentSummary(days)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch payment summary'
      )
    }
  }
)

/**
 * Fetch payment status
 */
export const fetchPaymentStatus = createAsyncThunk(
  'mpesa/fetchPaymentStatus',
  async (
    payload: { paymentReference?: string; checkoutRequestId?: string } = {},
    { rejectWithValue } = {} as any
  ) => {
    try {
      const { paymentReference, checkoutRequestId } = payload
      const response = await mpesaAPI.getPaymentStatus(paymentReference, checkoutRequestId)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch payment status'
      )
    }
  }
)

/**
 * Fetch single transaction
 */
export const fetchTransaction = createAsyncThunk(
  'mpesa/fetchTransaction',
  async (receiptNumber: string, { rejectWithValue } = {} as any) => {
    try {
      const response = await mpesaAPI.getTransaction(receiptNumber)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch transaction'
      )
    }
  }
)

/**
 * Mpesa Slice
 */
const mpesaSlice = createSlice({
  name: 'mpesa',
  initialState,
  reducers: {
    /**
     * Clear STK push state
     */
    clearSTKPushState: (state) => {
      state.stkPush = initialState.stkPush
    },

    /**
     * Clear payment error
     */
    clearPaymentError: (state) => {
      state.payments.error = null
    },

    /**
     * Clear transaction error
     */
    clearTransactionError: (state) => {
      state.transactions.error = null
    },

    /**
     * Clear current payment
     */
    clearCurrentPayment: (state) => {
      state.currentPayment = initialState.currentPayment
    },

    /**
     * Clear current transaction
     */
    clearCurrentTransaction: (state) => {
      state.currentTransaction = initialState.currentTransaction
    },

    /**
     * Clear summary
     */
    clearSummary: (state) => {
      state.summary = initialState.summary
    },

    /**
     * Reset all state
     */
    resetMpesaState: () => initialState
  },

  extraReducers: (builder) => {
    // ========== Initiate STK Push ==========
    builder
      .addCase(initiateSTKPush.pending, (state) => {
        state.stkPush.loading = true
        state.stkPush.error = null
        state.stkPush.success = false
      })
      .addCase(initiateSTKPush.fulfilled, (state, action) => {
        state.stkPush.loading = false
        state.stkPush.success = true
        state.stkPush.checkoutRequestId = action.payload.checkout_request_id
        state.stkPush.paymentReference = action.payload.payment_reference
        state.stkPush.paymentId = action.payload.payment_id
      })
      .addCase(initiateSTKPush.rejected, (state, action) => {
        state.stkPush.loading = false
        state.stkPush.error = action.payload as string
        state.stkPush.success = false
      })

    // ========== Fetch Payment History ==========
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.payments.loading = true
        state.payments.error = null
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.payments.loading = false
        state.payments.data = action.payload
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.payments.loading = false
        state.payments.error = action.payload as string
      })

    // ========== Fetch Transactions ==========
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.transactions.loading = true
        state.transactions.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions.loading = false
        state.transactions.data = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactions.loading = false
        state.transactions.error = action.payload as string
      })

    // ========== Fetch Payment Summary ==========
    builder
      .addCase(fetchPaymentSummary.pending, (state) => {
        state.summary.loading = true
        state.summary.error = null
      })
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.summary.loading = false
        state.summary.data = action.payload
      })
      .addCase(fetchPaymentSummary.rejected, (state, action) => {
        state.summary.loading = false
        state.summary.error = action.payload as string
      })

    // ========== Fetch Payment Status ==========
    builder
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.currentPayment.loading = true
        state.currentPayment.error = null
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.currentPayment.loading = false
        state.currentPayment.data = action.payload.payment
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.currentPayment.loading = false
        state.currentPayment.error = action.payload as string
      })

    // ========== Fetch Single Transaction ==========
    builder
      .addCase(fetchTransaction.pending, (state) => {
        state.currentTransaction.loading = true
        state.currentTransaction.error = null
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.currentTransaction.loading = false
        state.currentTransaction.data = action.payload
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.currentTransaction.loading = false
        state.currentTransaction.error = action.payload as string
      })
  }
})

export const {
  clearSTKPushState,
  clearPaymentError,
  clearTransactionError,
  clearCurrentPayment,
  clearCurrentTransaction,
  clearSummary,
  resetMpesaState
} = mpesaSlice.actions

export default mpesaSlice.reducer