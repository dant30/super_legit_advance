// frontend/src/pages/loans/LoanCreate.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@components/shared'
import { LoanForm } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'

const LoanCreate = () => {
  const navigate = useNavigate()
  const { useCreateLoan } = useLoanContext()
  const createLoan = useCreateLoan()

  const handleSubmit = async (values) => {
    await createLoan.mutateAsync(values)
    navigate('/loans')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Loan" subTitle="Register a new loan" />
      <LoanForm onSubmit={handleSubmit} submitting={createLoan.isLoading} />
    </div>
  )
}

export default LoanCreate
