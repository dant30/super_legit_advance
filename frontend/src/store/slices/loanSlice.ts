// frontend/src/store/slices/loanSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loansAPI, Loan, LoanApplication, Collateral, LoanStats } from '@/lib/api/loans'

/* =====================================================
 * State Interface
 * ===================================================== */

interface LoanState {
  // Loans
  loans: Loan[]
  selectedLoan: Loan | null
  loansLoading: boolean
  loansError: string | null

  // Loan Applications
  applications: LoanApplication[]
  selectedApplication: LoanApplication | null
  applicationsLoading: boolean
  applicationsError: string | null

  // Collaterals
  collaterals: Collateral[]
  selectedCollateral: Collateral | null
  collateralsLoading: boolean
  collateralsError: string | null

  // Statistics
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
    start_date?: string
    end_date?: string
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

/* =====================================================
 * Initial State
 * ===================================================== */

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

/* =====================================================
 * Async Thunks - Loans
 * ===================================================== */

export const fetchLoans = createAsyncThunk(
  'loans/fetchLoans',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      return await loansAPI.getLoans(params)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch loans')
    }
  }
)

export const fetchLoanById = createAsyncThunk(
  'loans/fetchLoanById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const loanId = typeof id === 'string' ? parseInt(id, 10) : id
      return await loansAPI.getLoan(loanId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch loan')
    }
  }
)

export const createLoan = createAsyncThunk(
  'loans/createLoan',
  async (data: any, { rejectWithValue }) => {
    try {
      return await loansAPI.createLoan(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create loan')
    }
  }
)

export const updateLoan = createAsyncThunk(
  'loans/updateLoan',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.updateLoan(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update loan')
    }
  }
)

export const approveLoan = createAsyncThunk(
  'loans/approveLoan',
  async ({ id, data }: { id: number; data?: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.approveLoan(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to approve loan')
    }
  }
)

export const rejectLoan = createAsyncThunk(
  'loans/rejectLoan',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      return await loansAPI.rejectLoan(id, { rejection_reason: reason })
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to reject loan')
    }
  }
)

export const disburseLoan = createAsyncThunk(
  'loans/disburseLoan',
  async ({ id, data }: { id: number; data?: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.disburseLoan(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to disburse loan')
    }
  }
)

export const calculateLoan = createAsyncThunk(
  'loans/calculateLoan',
  async (data: any, { rejectWithValue }) => {
    try {
      return await loansAPI.calculateLoan(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to calculate loan')
    }
  }
)

export const fetchLoanStats = createAsyncThunk(
  'loans/fetchLoanStats',
  async (params: any = {}, { rejectWithValue }) => {  // ✅ Has default params
    try {
      return await loansAPI.getLoanStats()
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch loan stats')
    }
  }
)

/* =====================================================
 * Async Thunks - Loan Applications
 * ===================================================== */

export const fetchLoanApplications = createAsyncThunk(
  'loans/fetchLoanApplications',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      return await loansAPI.getLoanApplications(params)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch applications')
    }
  }
)

export const fetchLoanApplicationById = createAsyncThunk(
  'loans/fetchLoanApplicationById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await loansAPI.getLoanApplication(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch application')
    }
  }
)

export const createLoanApplication = createAsyncThunk(
  'loans/createLoanApplication',
  async (data: any, { rejectWithValue }) => {
    try {
      return await loansAPI.createLoanApplication(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create application')
    }
  }
)

export const updateLoanApplication = createAsyncThunk(
  'loans/updateLoanApplication',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.updateLoanApplication(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update application')
    }
  }
)

export const submitLoanApplication = createAsyncThunk(
  'loans/submitLoanApplication',
  async (id: number, { rejectWithValue }) => {
    try {
      return await loansAPI.submitLoanApplication(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to submit application')
    }
  }
)

export const reviewLoanApplication = createAsyncThunk(
  'loans/reviewLoanApplication',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.reviewLoanApplication(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to review application')
    }
  }
)

export const approveLoanApplication = createAsyncThunk(
  'loans/approveLoanApplication',
  async ({ id, data }: { id: number; data?: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.approveLoanApplication(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to approve application')
    }
  }
)

export const rejectLoanApplication = createAsyncThunk(
  'loans/rejectLoanApplication',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      return await loansAPI.rejectLoanApplication(id, { rejection_reason: reason })
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to reject application')
    }
  }
)

/* =====================================================
 * Async Thunks - Collaterals
 * ===================================================== */

export const fetchCollaterals = createAsyncThunk(
  'loans/fetchCollaterals',
  async ({ loanId, params }: { loanId: number; params?: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.getCollaterals(loanId, params)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch collaterals')
    }
  }
)

export const fetchCollateralById = createAsyncThunk(
  'loans/fetchCollateralById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await loansAPI.getCollateral(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch collateral')
    }
  }
)

export const createCollateral = createAsyncThunk(
  'loans/createCollateral',
  async ({ loanId, data }: { loanId: number; data: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.createCollateral(loanId, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create collateral')
    }
  }
)

export const updateCollateral = createAsyncThunk(
  'loans/updateCollateral',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.updateCollateral(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update collateral')
    }
  }
)

export const releaseCollateral = createAsyncThunk(
  'loans/releaseCollateral',
  async ({ id, data }: { id: number; data?: any }, { rejectWithValue }) => {
    try {
      return await loansAPI.releaseCollateral(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to release collateral')
    }
  }
)

/* =====================================================
 * Slice
 * ===================================================== */

const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    // Loan reducers
    clearLoansError: (state) => {
      state.loansError = null
    },
    clearSelectedLoan: (state) => {
      state.selectedLoan = null
    },
    setLoanFilters: (state, action: PayloadAction<any>) => {
      state.loanFilters = action.payload
      state.loanPagination.page = 1
    },
    setLoanPage: (state, action: PayloadAction<number>) => {
      state.loanPagination.page = action.payload
    },

    // Application reducers
    clearApplicationsError: (state) => {
      state.applicationsError = null
    },
    clearSelectedApplication: (state) => {
      state.selectedApplication = null
    },
    setApplicationFilters: (state, action: PayloadAction<any>) => {
      state.applicationFilters = action.payload
      state.applicationPagination.page = 1
    },
    setApplicationPage: (state, action: PayloadAction<number>) => {
      state.applicationPagination.page = action.payload
    },

    // Collateral reducers
    clearCollateralsError: (state) => {
      state.collateralsError = null
    },
    clearSelectedCollateral: (state) => {
      state.selectedCollateral = null
    },

    // Stats reducers
    clearStatsError: (state) => {
      state.statsError = null
    },
  },
  extraReducers: (builder) => {
    /* ---- LOANS ---- */
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

    /* ---- LOAN STATS ---- */
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

    /* ---- LOAN APPLICATIONS ---- */
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

      .addCase(updateLoanApplication.pending, (state) => {
        state.applicationsLoading = true
        state.applicationsError = null
      })
      .addCase(updateLoanApplication.fulfilled, (state, action) => {
        state.applicationsLoading = false
        const index = state.applications.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.selectedApplication?.id === action.payload.id) {
          state.selectedApplication = action.payload
        }
      })
      .addCase(updateLoanApplication.rejected, (state, action) => {
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

    /* ---- COLLATERALS ---- */
    builder
      .addCase(fetchCollaterals.pending, (state) => {
        state.collateralsLoading = true
        state.collateralsError = null
      })
      .addCase(fetchCollaterals.fulfilled, (state, action) => {
        state.collateralsLoading = false
        state.collaterals = action.payload.results || []
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

      .addCase(createCollateral.pending, (state) => {
        state.collateralsLoading = true
        state.collateralsError = null
      })
      .addCase(createCollateral.fulfilled, (state, action) => {
        state.collateralsLoading = false
        state.collaterals.unshift(action.payload)
      })
      .addCase(createCollateral.rejected, (state, action) => {
        state.collateralsLoading = false
        state.collateralsError = action.payload as string
      })

      .addCase(updateCollateral.pending, (state) => {
        state.collateralsLoading = true
        state.collateralsError = null
      })
      .addCase(updateCollateral.fulfilled, (state, action) => {
        state.collateralsLoading = false
        const index = state.collaterals.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.collaterals[index] = action.payload
        }
        if (state.selectedCollateral?.id === action.payload.id) {
          state.selectedCollateral = action.payload
        }
      })
      .addCase(updateCollateral.rejected, (state, action) => {
        state.collateralsLoading = false
        state.collateralsError = action.payload as string
      })

      .addCase(releaseCollateral.pending, (state) => {
        state.collateralsLoading = true
        state.collateralsError = null
      })
      .addCase(releaseCollateral.fulfilled, (state, action) => {
        state.collateralsLoading = false
        const index = state.collaterals.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.collaterals[index] = action.payload
        }
        if (state.selectedCollateral?.id === action.payload.id) {
          state.selectedCollateral = action.payload
        }
      })
      .addCase(releaseCollateral.rejected, (state, action) => {
        state.collateralsLoading = false
        state.collateralsError = action.payload as string
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