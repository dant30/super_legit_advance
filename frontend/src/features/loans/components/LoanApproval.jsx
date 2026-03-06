import React, { useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'

const LoanApproval = ({ item, onApprove, onReject, submitting = false }) => {
  const [approvedAmount, setApprovedAmount] = useState(item?.amount_requested || '')
  const [interestRate, setInterestRate] = useState(item?.interest_rate || '12.5')
  const [reason, setReason] = useState('')

  useEffect(() => {
    setApprovedAmount(item?.amount_requested || '')
    setInterestRate(item?.interest_rate || '12.5')
    setReason('')
  }, [item])

  if (!item) return null

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900">Approval</h3>
      <div className="mt-4 space-y-3">
        <Input
          label="Approved Amount"
          type="number"
          value={approvedAmount}
          onChange={(e) => setApprovedAmount(e.target.value)}
        />
        <Input
          label="Interest Rate (%)"
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />
        <div>
          <label className="ui-label">Rejection Reason</label>
          <textarea
            className="ui-control ui-focus mt-1 w-full px-3 py-2 text-sm text-gray-900"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" loading={submitting} onClick={() => onApprove?.({ approved_amount: approvedAmount, interest_rate: interestRate })}>
            Approve
          </Button>
          <Button variant="danger" loading={submitting} onClick={() => onReject?.(reason)}>
            Reject
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default LoanApproval
