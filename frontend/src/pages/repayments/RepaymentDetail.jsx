// frontend/src/pages/repayments/RepaymentDetail.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '@components/shared/PageHeader'
import Button from '@components/ui/Button'
import Modal from '@components/ui/Modal'
import Input from '@components/ui/Input'
import {
  RepaymentDetails,
  PaymentSchedule,
  PaymentReceipt,
} from '@components/repayments'
import { useRepaymentContext } from '@contexts/RepaymentContext'

const RepaymentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    selectedRepayment,
    schedules,
    loading,
    getRepaymentById,
    getSchedules,
    processRepayment,
    waiveRepayment,
    cancelRepayment,
    formatCurrency,
    formatStatus,
  } = useRepaymentContext()

  const [processOpen, setProcessOpen] = useState(false)
  const [waiveOpen, setWaiveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!id) return
    getRepaymentById(id)
  }, [id])

  useEffect(() => {
    const loanId = selectedRepayment?.loan?.id
    if (loanId) getSchedules(loanId)
  }, [selectedRepayment?.loan?.id])

  const handleProcess = async () => {
    await processRepayment(id, {
      amount: amount || selectedRepayment?.amount_due,
      payment_method: selectedRepayment?.payment_method || 'CASH',
      reference: selectedRepayment?.payment_reference || '',
    })
    setProcessOpen(false)
  }

  const handleWaive = async () => {
    await waiveRepayment(id, { amount, reason })
    setWaiveOpen(false)
  }

  const handleCancel = async () => {
    await cancelRepayment(id, { reason })
    setCancelOpen(false)
  }

  const resetModalFields = () => {
    setAmount('')
    setReason('')
  }

  return (
    <div>
      <PageHeader
        title="Repayment Detail"
        subTitle={`Repayment #${selectedRepayment?.repayment_number || ''}`}
        extra={[
          <Button key="back" variant="outline" onClick={() => navigate('/repayments')}>
            Back
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RepaymentDetails
            repayment={selectedRepayment}
            onProcess={() => { resetModalFields(); setProcessOpen(true) }}
            onWaive={() => { resetModalFields(); setWaiveOpen(true) }}
            onCancel={() => { resetModalFields(); setCancelOpen(true) }}
            formatCurrency={formatCurrency}
            formatStatus={formatStatus}
          />

          <PaymentSchedule items={schedules} loading={loading} />
        </div>

        <div className="space-y-6">
          <PaymentReceipt repayment={selectedRepayment} />
        </div>
      </div>

      <Modal open={processOpen} onClose={() => setProcessOpen(false)} title="Process Payment" size="sm">
        <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setProcessOpen(false)}>Cancel</Button>
          <Button onClick={handleProcess} loading={loading}>Process</Button>
        </div>
      </Modal>

      <Modal open={waiveOpen} onClose={() => setWaiveOpen(false)} title="Waive Amount" size="sm">
        <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
        <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setWaiveOpen(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleWaive} loading={loading}>Apply Waiver</Button>
        </div>
      </Modal>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Repayment" size="sm">
        <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
          <Button variant="danger" onClick={handleCancel} loading={loading}>Cancel Repayment</Button>
        </div>
      </Modal>
    </div>
  )
}

export default RepaymentDetail
