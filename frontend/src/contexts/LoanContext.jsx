// frontend/src/contexts/LoanContext.jsx
import React, { createContext, useContext } from 'react'
import useLoans from '@hooks/useLoans'

const LoanContext = createContext(null)

export const LoanProvider = ({ children }) => {
  const loans = useLoans()

  return <LoanContext.Provider value={loans}>{children}</LoanContext.Provider>
}

export const useLoanContext = () => {
  const ctx = useContext(LoanContext)
  if (!ctx) {
    throw new Error('useLoanContext must be used within LoanProvider')
  }
  return ctx
}

export default LoanContext