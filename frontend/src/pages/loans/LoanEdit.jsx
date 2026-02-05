// frontend/src/pages/loans/LoanEdit.jsx
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@components/shared'
import { LoanForm } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'

const LoanEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { useLoanQuery, useUpdateLoan } = useLoanContext()
  const { data: loan, isLoading } = useLoanQuery(id)
  const updateLoan = useUpdateLoan()

  const handleSubmit = async (values) => {
    await updateLoan.mutateAsync({ id, data: values })
    navigate(`/loans/${id}`)
  }

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Loan" subTitle={`Loan #${loan?.loan_number || id}`} />
      <LoanForm initialValues={loan || {}} onSubmit={handleSubmit} submitting={updateLoan.isLoading} />
    </div>
  )
}

export default LoanEdit
