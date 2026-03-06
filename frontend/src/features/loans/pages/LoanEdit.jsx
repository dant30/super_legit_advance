import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '@components/ui/PageHeader'
import { LoanForm } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'
import { useCustomerContext } from '@contexts/CustomerContext'

const LoanEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { useLoanQuery, useUpdateLoan } = useLoanContext()
  const { customers, fetchCustomers } = useCustomerContext()
  const { data: loan, isLoading } = useLoanQuery(id)
  const updateLoan = useUpdateLoan()
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
      await updateLoan.mutateAsync({ id, data: values })
      navigate(`/loans/${id}`)
    } catch (error) {
      setSubmitError(error?.response?.data?.detail || error?.message || 'Failed to update loan.')
    }
  }

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Loan" subTitle={`Loan #${loan?.loan_number || id}`} />
      <LoanForm
        initialValues={loan || {}}
        onSubmit={handleSubmit}
        submitting={updateLoan.isPending}
        submitError={submitError}
        customerOptions={customerOptions}
        mode="edit"
      />
    </div>
  )
}

export default LoanEdit
