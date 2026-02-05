// frontend/src/components/loans/LoanApproval.jsx
import React, { useState } from 'react'
import { Button, Card } from '@components/ui'

const LoanApproval = ({ item, onApprove, onReject, submitting = false }) => {
  const [approvedAmount, setApprovedAmount] = useState(item?.amount_requested || '')
  const [interestRate, setInterestRate] = useState(item?.interest_rate || '12.5')
  const [reason, setReason] = useState('')

  if (!item) return null

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900">Approval</h3>
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Approved Amount</label>
          <input
            className="mt-1 w-full rounded-md border-gray-300 text-sm"
            type="number"
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Interest Rate (%)</label>
          <input
            className="mt-1 w-full rounded-md border-gray-300 text-sm"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Rejection Reason</label>
          <textarea
            className="mt-1 w-full rounded-md border-gray-300 text-sm"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="primary" loading={submitting} onClick={() => onApprove?.({ approved_amount: approvedAmount, interest_rate: interestRate })}>
            Approve
          </Button>
          <Button type="default" danger loading={submitting} onClick={() => onReject?.(reason)}>
            Reject
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default LoanApproval
