import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Modal, { ConfirmationModal } from '@components/ui/Modal'
import PageHeader from '@components/ui/PageHeader'
import { LoanDetails } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'

const LoanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { useLoanQuery, useApproveLoan, useRejectLoan, useDisburseLoan, useDeleteLoan } = useLoanContext()
  const { data: loan, isLoading } = useLoanQuery(id)
  const approveLoan = useApproveLoan()
  const rejectLoan = useRejectLoan()
  const disburseLoan = useDisburseLoan()
  const deleteLoan = useDeleteLoan()
  const status = String(loan?.status || '').toUpperCase()

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [disburseOpen, setDisburseOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [approvedAmount, setApprovedAmount] = useState('')
  const [approvedInterestRate, setApprovedInterestRate] = useState('')
  const [disbursementAmount, setDisbursementAmount] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const canEdit = !['ACTIVE', 'OVERDUE', 'COMPLETED'].includes(status)
  const canApproveOrReject = ['PENDING', 'UNDER_REVIEW'].includes(status)
  const canDisburse = status === 'APPROVED'
  const canDelete = ['DRAFT', 'REJECTED', 'CANCELLED'].includes(status)

  useEffect(() => {
    setApprovedAmount(String(loan?.amount_requested || ''))
    setApprovedInterestRate(String(loan?.interest_rate || ''))
    setDisbursementAmount(String(loan?.amount_approved || loan?.amount_requested || ''))
    setRejectionReason(loan?.rejection_reason || '')
    setActionError('')
  }, [loan])

  const customerName = useMemo(
    () => loan?.customer_details?.full_name || loan?.customer_name || 'Loan details',
    [loan]
  )

  const normalizeActionError = (error, fallback) => {
    const payload = error?.response?.data
    if (typeof payload?.detail === 'string') return payload.detail
    if (typeof payload?.message === 'string') return payload.message
    if (payload && typeof payload === 'object') {
      const firstValue = Object.values(payload).find((value) => {
        if (typeof value === 'string') return true
        return Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
      })
      if (typeof firstValue === 'string') return firstValue
      if (Array.isArray(firstValue)) return firstValue[0]
    }
    return error?.message || fallback
  }

  const handleApprove = async () => {
    setActionError('')
    try {
      await approveLoan.mutateAsync({
        id,
        data: {
          approved_amount: approvedAmount,
          interest_rate: approvedInterestRate,
        },
      })
      setApproveOpen(false)
    } catch (error) {
      setActionError(normalizeActionError(error, 'Failed to approve loan.'))
    }
  }

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) {
      setActionError('Rejection reason must be at least 10 characters.')
      return
    }

    setActionError('')
    try {
      await rejectLoan.mutateAsync({ id, reason: rejectionReason.trim() })
      setRejectOpen(false)
    } catch (error) {
      setActionError(normalizeActionError(error, 'Failed to reject loan.'))
    }
  }

  const handleDisburse = async () => {
    setActionError('')
    try {
      await disburseLoan.mutateAsync({
        id,
        data: {
          disbursement_amount: disbursementAmount,
        },
      })
      setDisburseOpen(false)
    } catch (error) {
      setActionError(normalizeActionError(error, 'Failed to disburse loan.'))
    }
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteLoan.mutateAsync(id)
      navigate('/loans')
    } catch (error) {
      setActionError(normalizeActionError(error, 'Failed to delete loan.'))
      setDeleteOpen(false)
    }
  }

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Loan ${loan?.loan_number || ''}`}
        subTitle={customerName}
        extra={[
          canEdit ? (
            <Button key="edit" onClick={() => navigate(`/loans/${id}/edit`)}>Edit</Button>
          ) : null,
          canApproveOrReject ? (
            <Button key="approve" variant="primary" onClick={() => setApproveOpen(true)}>
              Approve
            </Button>
          ) : null,
          canApproveOrReject ? (
            <Button key="reject" variant="danger" onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
          ) : null,
          canDisburse ? (
            <Button key="disburse" variant="success" onClick={() => setDisburseOpen(true)}>
              Disburse
            </Button>
          ) : null,
          canDelete ? (
            <Button key="delete" variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          ) : null,
        ]}
      />

      {actionError ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {actionError}
        </div>
      ) : null}

      <LoanDetails loan={loan} />

      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve loan"
        description="Confirm the approved amount and final rate before moving the loan to approved status."
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Approved Amount"
            type="number"
            min="0"
            step="0.01"
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(e.target.value)}
          />
          <Input
            label="Approved Interest Rate (%)"
            type="number"
            min="0"
            step="0.01"
            value={approvedInterestRate}
            onChange={(e) => setApprovedInterestRate(e.target.value)}
          />
          <Modal.Footer>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={approveLoan.isPending} onClick={handleApprove}>
              Approve Loan
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject loan"
        description="Provide a clear rejection reason for audit and borrower follow-up."
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="loan-rejection-reason" className="ui-label">Rejection Reason</label>
            <textarea
              id="loan-rejection-reason"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="ui-control ui-focus mt-1 w-full px-3 py-2 text-sm text-gray-900"
            />
          </div>
          <Modal.Footer>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={rejectLoan.isPending} onClick={handleReject}>
              Reject Loan
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal
        open={disburseOpen}
        onClose={() => setDisburseOpen(false)}
        title="Disburse loan"
        description="Confirm the amount being disbursed to activate this facility."
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Disbursement Amount"
            type="number"
            min="0"
            step="0.01"
            value={disbursementAmount}
            onChange={(e) => setDisbursementAmount(e.target.value)}
          />
          <Modal.Footer>
            <Button variant="outline" onClick={() => setDisburseOpen(false)}>Cancel</Button>
            <Button variant="success" loading={disburseLoan.isPending} onClick={handleDisburse}>
              Disburse Loan
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <ConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete loan"
        description="Only draft, rejected, or cancelled loans can be removed. This action cannot be undone."
        confirmText="Delete Loan"
        loading={deleteLoan.isPending}
      />
    </div>
  )
}

export default LoanDetail
