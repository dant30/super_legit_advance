// frontend/src/contexts/CustomerContext.jsx
import React, { createContext, useContext } from 'react'
import { useCustomers } from '../hooks/useCustomers'

const CustomerContext = createContext({})

export const useCustomerContext = () => useContext(CustomerContext)

export const CustomerProvider = ({ children }) => {
  const customerState = useCustomers()

  return (
    <CustomerContext.Provider value={customerState}>
      {children}
    </CustomerContext.Provider>
  )
}