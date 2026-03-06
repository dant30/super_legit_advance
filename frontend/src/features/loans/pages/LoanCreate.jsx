import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/ui/PageHeader'
import { LoanForm } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'
import { useCustomerContext } from '@contexts/CustomerContext'

const LoanCreate = () => {
  const navigate = useNavigate()
  const { useCreateLoan } = useLoanContext()
  const { customers, fetchCustomers } = useCustomerContext()
  const createLoan = useCreateLoan()
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetchCustomers({ page_size: 100, status: 'ACTIVE' })
  }, [fetchCustomers])

  const customerOptions = useMemo(
    () =>
      (customers || []).map((customer) => ({
        value: customer.id,
        label: `${customer.full_name} (${customer.customer_number})`,
      })),
    [customers]
  )

  const handleSubmit = async (values) => {
    setSubmitError('')
    try {
      await createLoan.mutateAsync(values)
      navigate('/loans')
    } catch (error) {
      setSubmitError(error?.response?.data?.detail || error?.message || 'Failed to create loan.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Loan" subTitle="Register a new loan" />
      <LoanForm
        onSubmit={handleSubmit}
        submitting={createLoan.isPending}
        submitError={submitError}
        customerOptions={customerOptions}
        mode="create"
      />
    </div>
  )
}

export default LoanCreate
