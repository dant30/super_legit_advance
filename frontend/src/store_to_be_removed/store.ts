// frontend/src/store/store.ts
import { configureStore } from '@reduxjs/toolkit'

import uiReducer from '@/store/slices/uiSlice'
import authReducer from '@/store/slices/authSlice'
import loanReducer from '@/store/slices/loanSlice'
import customerReducer from '@/store/slices/customerSlice'
import repaymentReducer from '@/store/slices/repaymentSlice'
import notificationReducer from '@/store/slices/notificationSlice'
import auditReducer from '@/store/slices/auditSlice'
import mpesaReducer from './slices/mpesaSlice'
import reportReducer from './slices/reportSlice' // 👈 ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loans: loanReducer,
    customers: customerReducer,
    repayments: repaymentReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    audit: auditReducer,
    mpesa: mpesaReducer,
    reports: reportReducer, // 👈 REGISTER HERE
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled'],
        ignoredPaths: [
          'auth.user.date_joined',
          'auth.user.last_login',
        ],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch