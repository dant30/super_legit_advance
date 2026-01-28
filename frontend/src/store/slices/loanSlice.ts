// frontend/src/store/slices/loanSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loansAPI } from '@/lib/api/loans'
import { Loan, LoanApplication, Collateral, LoanStats } from '@/lib/api/loans'

interface LoanState {
  // Loans state
  loans: Loan[]
  selectedLoan: Loan | null
  loansLoading: boolean
  loansError: string | null
  
  // Loan Applications state
  applications: LoanApplication[]
  selectedApplication: LoanApplication | null
  applicationsLoading: boolean
  applicationsError: string | null
  
  // Collateral state
  collaterals: Collateral[]
  selectedCollateral: Collateral | null
  collateralsLoading: boolean
  collateralsError: string | null
  
  // Statistics state
  stats: LoanStats | null
  statsLoading: boolean
  statsError: string | null
  
  // Filters
  loanFilters: {
    status?: string
    loan_type?: string
    risk_level?: string
    search?: string
    customer_id?: number
    start_date?: string
    end_date?: string
  }
  
  applicationFilters: {
    status?: string
    loan_type?: string
    pending?: boolean
    my_applications?: boolean
    search?: string
  }
  
  // Pagination
  loanPagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
  
  applicationPagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

const initialState: LoanState = {
  loans: [],
  selectedLoan: null,
  loansLoading: false,
  loansError: null,
  
  applications: [],
  selectedApplication: null,
  applicationsLoading: false,
  applicationsError: null,
  
  collaterals: [],
  selectedCollateral: null,
  collateralsLoading: false,
  collateralsError: null,
  
  stats: null,
  statsLoading: false,
  statsError: null,
  
  loanFilters: {},
  applicationFilters: {},
  
  loanPagination: {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  },
  
  applicationPagination: {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  },
}

// Async thunks for Loans
export const fetchLoans = createAsyncThunk(
  'loans/fetchLoans',
  async (params: any = {}) => {
    return loansAPI.getLoans(params)
  }
)

export const fetchLoanById = createAsyncThunk(
  'loans/fetchLoanById',
  async (id: string | number) => {
    return loansAPI.getLoan(typeof id === 'string' ? parseInt(id, 10) : id)
  }
)

export const createLoan = createAsyncThunk(
  'loans/createLoan',
  async (data: any) => {
    return loansAPI.createLoan(data)
  }
)

export const updateLoan = createAsyncThunk(
  'loans/updateLoan',
  async ({ id, data }: { id: number; data: any }) => {
    return loansAPI.updateLoan(id, data)
  }
)

export const approveLoan = createAsyncThunk(
  'loans/approveLoan',
  async ({ id, data }: { id: number; data?: any }, { rejectWithValue }) => {
    try {
      const response = await loansAPI.approveLoan(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to approve loan'
      )
    }
  }
)

export const rejectLoan = createAsyncThunk(
  'loans/rejectLoan',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await loansAPI.rejectLoan(id, { rejection_reason: reason })
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to reject loan'
      )
    }
  }
)

export const disburseLoan = createAsyncThunk(
  'loans/disburseLoan',
  async ({ id, data }: { id: number; data?: any }, { rejectWithValue }) => {
    try {
      const response = await loansAPI.disburseLoan(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to disburse loan'
      )
    }
  }
)

// Async thunks for Loan Applications
export const fetchLoanApplications = createAsyncThunk(
  'loans/fetchLoanApplications',
  async (
    params?: {
      page?: number
      page_size?: number
      search?: string
      status?: string
      loan_type?: string
      risk_level?: string
      pending?: boolean
      my_applications?: boolean
      reviewer_id?: number
      start_date?: string
      end_date?: string
      ordering?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await loansAPI.getLoanApplications(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch loan applications'
      )
    }
  }
)

export const fetchLoanApplicationById = createAsyncThunk(
  'loans/fetchLoanApplicationById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await loansAPI.getLoanApplication(id)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch loan application'
      )
    }
  }
)

export const createLoanApplication = createAsyncThunk(
  'loans/createLoanApplication',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await loansAPI.createLoanApplication(data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to create loan application'
      )
    }
  }
)

export const submitLoanApplication = createAsyncThunk(
  'loans/submitLoanApplication',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await loansAPI.submitLoanApplication(id)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to submit loan application'
      )
    }
  }
)

export const approveLoanApplication = createAsyncThunk(
  'loans/approveLoanApplication',
  async ({ id, data }: { id: number; data?: any }, { rejectWithValue }) => {
    try {
      const response = await loansAPI.approveLoanApplication(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to approve loan application'
      )
    }
  }
)

export const rejectLoanApplication = createAsyncThunk(
  'loans/rejectLoanApplication',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await loansAPI.rejectLoanApplication(id, { rejection_reason: reason })
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to reject loan application'
      )
    }
  }
)

// Async thunks for Collateral
export const fetchCollaterals = createAsyncThunk(
  'loans/fetchCollaterals',
  async (
    { loanId, params }: { loanId: number; params?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await loansAPI.getCollaterals(loanId, params)
      return { loanId, response }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch collaterals'
      )
    }
  }
)

export const fetchCollateralById = createAsyncThunk(
  'loans/fetchCollateralById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await loansAPI.getCollateral(id)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch collateral'
      )
    }
  }
)

// Async thunk for Statistics
export const fetchLoanStats = createAsyncThunk(
  'loans/fetchLoanStats',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await loansAPI.getLoanStats()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch loan stats')
    }
  }
)

const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    clearLoansError: (state) => {
      state.loansError = null
    },
    clearApplicationsError: (state) => {
      state.applicationsError = null
    },
    clearCollateralsError: (state) => {
      state.collateralsError = null
    },
    clearStatsError: (state) => {
      state.statsError = null
    },
    clearSelectedLoan: (state) => {
      state.selectedLoan = null
    },
    clearSelectedApplication: (state) => {
      state.selectedApplication = null
    },
    clearSelectedCollateral: (state) => {
      state.selectedCollateral = null
    },
    setLoanFilters: (state, action: PayloadAction<any>) => {
      state.loanFilters = action.payload
      state.loanPagination.page = 1
    },
    setApplicationFilters: (state, action: PayloadAction<any>) => {
      state.applicationFilters = action.payload
      state.applicationPagination.page = 1
    },
    setLoanPage: (state, action: PayloadAction<number>) => {
      state.loanPagination.page = action.payload
    },
    setApplicationPage: (state, action: PayloadAction<number>) => {
      state.applicationPagination.page = action.payload
    },
  },
  extraReducers: (builder) => {
    // Loans
    builder
      .addCase(fetchLoans.pending, (state) => {
        state.loansLoading = true
        state.loansError = null
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loansLoading = false
        state.loans = action.payload.results || []
        if (action.payload.count !== undefined) {
          state.loanPagination.total = action.payload.count
          state.loanPagination.total_pages = Math.ceil(
            action.payload.count / state.loanPagination.page_size
          )
        }
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loansLoading = false
        state.loansError = action.payload as string
      })
      
      .addCase(fetchLoanById.pending, (state) => {
        state.loansLoading = true
        state.loansError = null
      })
      .addCase(fetchLoanById.fulfilled, (state, action) => {
        state.loansLoading = false
        state.selectedLoan = action.payload
      })
      .addCase(fetchLoanById.rejected, (state, action) => {
        state.loansLoading = false
        state.loansError = action.payload as string
      })
      
      .addCase(createLoan.pending, (state) => {
        state.loansLoading = true
        state.loansError = null
      })
      .addCase(createLoan.fulfilled, (state, action) => {
        state.loansLoading = false
        state.loans.unshift(action.payload)
      })
      .addCase(createLoan.rejected, (state, action) => {
        state.loansLoading = false
        state.loansError = action.payload as string
      })
      
      .addCase(updateLoan.pending, (state) => {
        state.loansLoading = true
        state.loansError = null
      })
      .addCase(updateLoan.fulfilled, (state, action) => {
        state.loansLoading = false
        const index = state.loans.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.loans[index] = action.payload
        }
        if (state.selectedLoan?.id === action.payload.id) {
          state.selectedLoan = action.payload
        }
      })
      .addCase(updateLoan.rejected, (state, action) => {
        state.loansLoading = false
        state.loansError = action.payload as string
      })
      
      .addCase(approveLoan.pending, (state) => {
        state.loansLoading = true
        state.loansError = null
      })
      .addCase(approveLoan.fulfilled, (state, action) => {
        state.loansLoading = false
        const index = state.loans.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.loans[index] = action.payload
        }
        if (state.selectedLoan?.id === action.payload.id) {
          state.selectedLoan = action.payload
        }
      })
      .addCase(approveLoan.rejected, (state, action) => {
        state.loansLoading = false
        state.loansError = action.payload as string
      })
      
      .addCase(rejectLoan.pending, (state) => {
        state.loansLoading = true
        state.loansError = null
      })
      .addCase(rejectLoan.fulfilled, (state, action) => {
        state.loansLoading = false
        const index = state.loans.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.loans[index] = action.payload
        }
        if (state.selectedLoan?.id === action.payload.id) {
          state.selectedLoan = action.payload
        }
      })
      .addCase(rejectLoan.rejected, (state, action) => {
        state.loansLoading = false
        state.loansError = action.payload as string
      })
      
      .addCase(disburseLoan.pending, (state) => {
        state.loansLoading = true
        state.loansError = null
      })
      .addCase(disburseLoan.fulfilled, (state, action) => {
        state.loansLoading = false
        const index = state.loans.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.loans[index] = action.payload
        }
        if (state.selectedLoan?.id === action.payload.id) {
          state.selectedLoan = action.payload
        }
      })
      .addCase(disburseLoan.rejected, (state, action) => {
        state.loansLoading = false
        state.loansError = action.payload as string
      })
    
    // Loan Applications
    builder
      .addCase(fetchLoanApplications.pending, (state) => {
        state.applicationsLoading = true
        state.applicationsError = null
      })
      .addCase(fetchLoanApplications.fulfilled, (state, action) => {
        state.applicationsLoading = false
        state.applications = action.payload.results || []
        if (action.payload.count !== undefined) {
          state.applicationPagination.total = action.payload.count
          state.applicationPagination.total_pages = Math.ceil(
            action.payload.count / state.applicationPagination.page_size
          )
        }
      })
      .addCase(fetchLoanApplications.rejected, (state, action) => {
        state.applicationsLoading = false
        state.applicationsError = action.payload as string
      })
      
      .addCase(fetchLoanApplicationById.pending, (state) => {
        state.applicationsLoading = true
        state.applicationsError = null
      })
      .addCase(fetchLoanApplicationById.fulfilled, (state, action) => {
        state.applicationsLoading = false
        state.selectedApplication = action.payload
      })
      .addCase(fetchLoanApplicationById.rejected, (state, action) => {
        state.applicationsLoading = false
        state.applicationsError = action.payload as string
      })
      
      .addCase(createLoanApplication.pending, (state) => {
        state.applicationsLoading = true
        state.applicationsError = null
      })
      .addCase(createLoanApplication.fulfilled, (state, action) => {
        state.applicationsLoading = false
        state.applications.unshift(action.payload)
      })
      .addCase(createLoanApplication.rejected, (state, action) => {
        state.applicationsLoading = false
        state.applicationsError = action.payload as string
      })
      
      .addCase(submitLoanApplication.pending, (state) => {
        state.applicationsLoading = true
        state.applicationsError = null
      })
      .addCase(submitLoanApplication.fulfilled, (state, action) => {
        state.applicationsLoading = false
        const index = state.applications.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.selectedApplication?.id === action.payload.id) {
          state.selectedApplication = action.payload
        }
      })
      .addCase(submitLoanApplication.rejected, (state, action) => {
        state.applicationsLoading = false
        state.applicationsError = action.payload as string
      })
      
      .addCase(approveLoanApplication.pending, (state) => {
        state.applicationsLoading = true
        state.applicationsError = null
      })
      .addCase(approveLoanApplication.fulfilled, (state, action) => {
        state.applicationsLoading = false
        const index = state.applications.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.selectedApplication?.id === action.payload.id) {
          state.selectedApplication = action.payload
        }
      })
      .addCase(approveLoanApplication.rejected, (state, action) => {
        state.applicationsLoading = false
        state.applicationsError = action.payload as string
      })
      
      .addCase(rejectLoanApplication.pending, (state) => {
        state.applicationsLoading = true
        state.applicationsError = null
      })
      .addCase(rejectLoanApplication.fulfilled, (state, action) => {
        state.applicationsLoading = false
        const index = state.applications.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.selectedApplication?.id === action.payload.id) {
          state.selectedApplication = action.payload
        }
      })
      .addCase(rejectLoanApplication.rejected, (state, action) => {
        state.applicationsLoading = false
        state.applicationsError = action.payload as string
      })
    
    // Collateral
    builder
      .addCase(fetchCollaterals.pending, (state) => {
        state.collateralsLoading = true
        state.collateralsError = null
      })
      .addCase(fetchCollaterals.fulfilled, (state, action) => {
        state.collateralsLoading = false
        state.collaterals = action.payload.response.results || []
      })
      .addCase(fetchCollaterals.rejected, (state, action) => {
        state.collateralsLoading = false
        state.collateralsError = action.payload as string
      })
      
      .addCase(fetchCollateralById.pending, (state) => {
        state.collateralsLoading = true
        state.collateralsError = null
      })
      .addCase(fetchCollateralById.fulfilled, (state, action) => {
        state.collateralsLoading = false
        state.selectedCollateral = action.payload
      })
      .addCase(fetchCollateralById.rejected, (state, action) => {
        state.collateralsLoading = false
        state.collateralsError = action.payload as string
      })
    
    // Statistics
    builder
      .addCase(fetchLoanStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchLoanStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchLoanStats.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload as string
      })
  },
})

export const {
  clearLoansError,
  clearApplicationsError,
  clearCollateralsError,
  clearStatsError,
  clearSelectedLoan,
  clearSelectedApplication,
  clearSelectedCollateral,
  setLoanFilters,
  setApplicationFilters,
  setLoanPage,
  setApplicationPage,
} = loanSlice.actions

export default loanSlice.reducer