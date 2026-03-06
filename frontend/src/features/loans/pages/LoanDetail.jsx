// frontend/src/pages/loans/LoanDetail.jsx
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@components/ui/Button'
import PageHeader from '@components/ui/PageHeader'
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
  const status = String(loan?.status || '').toUpperCase()

  const canEdit = !['ACTIVE', 'OVERDUE', 'COMPLETED'].includes(status)
  const canApproveOrReject = ['PENDING', 'UNDER_REVIEW'].includes(status)
  const canDisburse = status === 'APPROVED'

  const handleApprove = async () => {
    await approveLoan.mutateAsync({ id, data: {} })
  }

  const handleReject = async () => {
    const reason = window.prompt('Enter rejection reason (min 10 chars)')
    if (!reason) return
    if (reason.trim().length < 10) return
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
          canEdit ? (
            <Button key="edit" onClick={() => navigate(`/loans/${id}/edit`)}>Edit</Button>
          ) : null,
          canApproveOrReject ? (
            <Button key="approve" type="primary" onClick={handleApprove} loading={approveLoan.isPending}>
              Approve
            </Button>
          ) : null,
          canApproveOrReject ? (
            <Button key="reject" danger onClick={handleReject} loading={rejectLoan.isPending}>
              Reject
            </Button>
          ) : null,
          canDisburse ? (
            <Button key="disburse" onClick={handleDisburse} loading={disburseLoan.isPending}>
              Disburse
            </Button>
          ) : null,
        ]}
      />
      <LoanDetails loan={loan} />
    </div>
  )
}

export default LoanDetail

