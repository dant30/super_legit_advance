// frontend/src/contexts/CustomerContext.jsx
import React, { createContext, useContext, useMemo } from 'react'
import { useCustomers } from '../hooks/useCustomers'

const CustomerContext = createContext(null)

export const useCustomerContext = () => {
  const ctx = useContext(CustomerContext)
  if (!ctx) {
    throw new Error('useCustomerContext must be used within CustomerProvider')
  }
  return ctx
}

export const CustomerProvider = ({ children }) => {
  const customerState = useCustomers()

  // Memoize to avoid re-renders in consumers
  const value = useMemo(() => customerState, [customerState])

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}

export default CustomerContext
