// frontend/src/components/loans/LoanCard.jsx
import React from 'react'
import { Card, Button } from '@components/ui'
import { formatCurrency } from '@api/loans'
import LoanStatusBadge from './LoanStatusBadge'

const LoanCard = ({ loan, onView }) => {
  if (!loan) return null

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{loan.loan_number || `#${loan.id}`}</p>
          <p className="text-xs text-gray-500">{loan.loan_type}</p>
        </div>
        <LoanStatusBadge status={loan.status} />
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-700">
          {loan.customer?.full_name || `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'Customer'}
        </p>
        <p className="text-xs text-gray-500">{loan.customer?.customer_number || loan.customer?.id_number}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(loan.amount_approved || loan.amount_requested)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Term</p>
          <p className="text-sm font-semibold text-gray-900">{loan.term_months || '--'} months</p>
        </div>
      </div>
      {onView && (
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={() => onView(loan.id)}>View Details</Button>
        </div>
      )}
    </Card>
  )
}

export default LoanCard
