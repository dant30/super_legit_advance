// frontend/src/pages/loans/LoanDetail.jsx
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@components/ui'
import { PageHeader } from '@components/shared'
import { LoanDetails } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'

const LoanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { useLoanQuery, useApproveLoan, useRejectLoan, useDisburseLoan } = useLoanContext()
  const { data: loan, isLoading } = useLoanQuery(id)
  const approveLoan = useApproveLoan()
  const rejectLoan = useRejectLoan()
  const disburseLoan = useDisburseLoan()

  const handleApprove = async () => {
    await approveLoan.mutateAsync({ id, data: {} })
  }

  const handleReject = async () => {
    const reason = window.prompt('Enter rejection reason (min 10 chars)')
    if (!reason) return
    await rejectLoan.mutateAsync({ id, reason })
  }

  const handleDisburse = async () => {
    await disburseLoan.mutateAsync({ id, data: {} })
  }

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Loan ${loan?.loan_number || ''}`}
        subTitle="Loan details"
        extra={[
          <Button key="edit" onClick={() => navigate(`/loans/${id}/edit`)}>Edit</Button>,
          <Button key="approve" type="primary" onClick={handleApprove} loading={approveLoan.isLoading}>Approve</Button>,
          <Button key="reject" danger onClick={handleReject} loading={rejectLoan.isLoading}>Reject</Button>,
          <Button key="disburse" onClick={handleDisburse} loading={disburseLoan.isLoading}>Disburse</Button>,
        ]}
      />
      <LoanDetails loan={loan} />
    </div>
  )
}

export default LoanDetail
