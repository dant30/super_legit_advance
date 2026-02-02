// frontend/src/contexts/RepaymentContext.jsx
import React, { createContext, useContext, useMemo } from 'react'
import useRepayments from '../hooks/useRepayments'

// Create context
const RepaymentContext = createContext(null)

// Provider component
export const RepaymentProvider = ({ children }) => {
  const repaymentState = useRepayments()

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => repaymentState, [repaymentState])

  return (
    <RepaymentContext.Provider value={contextValue}>
      {children}
    </RepaymentContext.Provider>
  )
}

// Custom hook to use repayment context
export const useRepaymentContext = () => {
  const context = useContext(RepaymentContext)
  
  if (!context) {
    throw new Error('useRepaymentContext must be used within a RepaymentProvider')
  }
  
  return context
}

// Constants export for convenience
export {
  REPAYMENT_STATUS,
  SCHEDULE_STATUS,
  PENALTY_STATUS,
  PAYMENT_METHOD,
  REPAYMENT_TYPE,
  PENALTY_TYPE
} from '../api/repayments'