import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Modal, { ConfirmationModal } from '@components/ui/Modal'
import PageHeader from '@components/ui/PageHeader'
import { useSelector } from 'react-redux'
import {
  RepaymentDetails,
  PaymentSchedule,
  PaymentReceipt,
} from '@components/repayments'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import {
  selectRepaymentSchedules,
  selectRepaymentsLoading,
  selectSelectedRepayment,
} from '../store'

const MUTABLE_STATUSES = new Set(['PENDING', 'PROCESSING', 'PARTIAL', 'OVERDUE', 'FAILED'])
const TERMINAL_STATUSES = new Set(['COMPLETED', 'WAIVED', 'CANCELLED'])

const RepaymentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const selectedRepayment = useSelector(selectSelectedRepayment)
  const schedules = useSelector(selectRepaymentSchedules)
  const loading = useSelector(selectRepaymentsLoading)
  const {
    getRepaymentById,
    getSchedules,
    processRepayment,
    waiveRepayment,
    cancelRepayment,
    deleteRepayment,
    formatCurrency,
    formatStatus,
  } = useRepaymentContext()

  const [processOpen, setProcessOpen] = useState(false)
  const [waiveOpen, setWaiveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState('')

  const status = String(selectedRepayment?.status || '').toUpperCase()
  const canEdit = MUTABLE_STATUSES.has(status)
  const canDelete = !TERMINAL_STATUSES.has(status)

  useEffect(() => {
    if (!id) return
    getRepaymentById(id).catch(() => {})
  }, [getRepaymentById, id])

  useEffect(() => {
    const loanId = selectedRepayment?.loan || selectedRepayment?.loan?.id
    if (!loanId) return
    getSchedules(loanId).catch(() => {})
  }, [getSchedules, selectedRepayment?.loan, selectedRepayment?.loan?.id])

  const normalizeActionError = (error, fallback) => {
    const payload = error?.response?.data
    if (typeof payload?.detail === 'string') return payload.detail
    if (typeof payload?.message === 'string') return payload.message
    if (typeof payload?.error === 'string') return payload.error

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

  const resetModalFields = () => {
    setAmount('')
    setReason('')
    setActionError('')
  }

  const handleProcess = async () => {
    const paymentAmount = Number(amount || selectedRepayment?.amount_due || 0)
    if (!paymentAmount || paymentAmount <= 0) {
      setActionError('Payment amount must be greater than zero.')
      return
    }

    setActionError('')
    try {
      await processRepayment(id, {
        amount: paymentAmount,
        payment_method: selectedRepayment?.payment_method || 'CASH',
        reference: selectedRepayment?.payment_reference || '',
      })
      setProcessOpen(false)
      resetModalFields()
    } catch (error) {
      setActionError(normalizeActionError(error, 'Failed to process repayment.'))
    }
  }

  const handleWaive = async () => {
    const waiverAmount = Number(amount || 0)
    if (!waiverAmount || waiverAmount <= 0) {
      setActionError('Waiver amount must be greater than zero.')
      return
    }
    if (!reason.trim()) {
      setActionError('Waiver reason is required.')
      return
    }

    setActionError('')
    try {
      await waiveRepayment(id, { amount: waiverAmount, reason: reason.trim() })
      setWaiveOpen(false)
      resetModalFields()
    } catch (error) {
      setActionError(normalizeActionError(error, 'Failed to waive repayment.'))
    }
  }

  const handleCancel = async () => {
    if (!reason.trim()) {
      setActionError('Cancellation reason is required.')
      return
    }

    setActionError('')
    try {
      await cancelRepayment(id, { reason: reason.trim() })
      setCancelOpen(false)
      resetModalFields()
    } catch (error) {
      setActionError(normalizeActionError(error, 'Failed to cancel repayment.'))
    }
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteRepayment(id)
      navigate('/repayments')
    } catch (error) {
      setDeleteOpen(false)
      setActionError(normalizeActionError(error, 'Failed to delete repayment.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repayment Detail"
        subTitle={`Repayment #${selectedRepayment?.repayment_number || ''}`}
        extra={[
          canEdit ? (
            <Button key="edit" onClick={() => navigate(`/repayments/${id}/edit`)}>
              Edit
            </Button>
          ) : null,
          <Button key="back" variant="outline" onClick={() => navigate('/repayments')}>
            Back
          </Button>,
        ]}
      />

      {actionError ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RepaymentDetails
            repayment={selectedRepayment}
            onEdit={canEdit ? () => navigate(`/repayments/${id}/edit`) : undefined}
            onDelete={canDelete ? () => {
              setActionError('')
              setDeleteOpen(true)
            } : undefined}
            onProcess={() => {
              resetModalFields()
              setProcessOpen(true)
            }}
            onWaive={() => {
              resetModalFields()
              setWaiveOpen(true)
            }}
            onCancel={() => {
              resetModalFields()
              setCancelOpen(true)
            }}
            formatCurrency={formatCurrency}
            formatStatus={formatStatus}
          />

          <PaymentSchedule items={schedules} loading={loading} />
        </div>

        <div className="space-y-6">
          <PaymentReceipt repayment={selectedRepayment} />
        </div>
      </div>

      <Modal
        open={processOpen}
        onClose={() => setProcessOpen(false)}
        title="Record Repayment"
        description="Apply a payment to this repayment record."
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
          />
          <Modal.Footer>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>Cancel</Button>
            <Button onClick={handleProcess} loading={loading}>Record Repayment</Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal
        open={waiveOpen}
        onClose={() => setWaiveOpen(false)}
        title="Waive Amount"
        description="Record an approved waiver against this repayment."
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
          />
          <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Modal.Footer>
            <Button variant="outline" onClick={() => setWaiveOpen(false)}>Cancel</Button>
            <Button variant="warning" onClick={handleWaive} loading={loading}>Apply Waiver</Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Repayment"
        description="Cancel this repayment with an audit reason."
        size="sm"
      >
        <div className="space-y-4">
          <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Modal.Footer>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
            <Button variant="danger" onClick={handleCancel} loading={loading}>Cancel Repayment</Button>
          </Modal.Footer>
        </div>
      </Modal>

      <ConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete repayment"
        description="Delete this repayment record? This action cannot be undone."
        confirmText="Delete Repayment"
        loading={loading}
      />
    </div>
  )
}

export default RepaymentDetail
