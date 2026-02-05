// frontend/src/components/loans/LoanDetails.jsx
import React from 'react'
import { Card } from '@components/ui'
import { formatCurrency, LOAN_STATUS_LABELS } from '@api/loans'
import LoanStatusBadge from './LoanStatusBadge'
import AmortizationSchedule from './AmortizationSchedule'

const LoanDetails = ({ loan }) => {
  if (!loan) return null

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{loan.loan_number || `Loan #${loan.id}`}</h2>
            <p className="text-xs text-gray-500">{LOAN_STATUS_LABELS[loan.status] || loan.status}</p>
          </div>
          <LoanStatusBadge status={loan.status} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Customer</p>
            <p className="text-sm text-gray-900">
              {loan.customer?.full_name || `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'Customer'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount Approved</p>
            <p className="text-sm text-gray-900">{formatCurrency(loan.amount_approved || loan.amount_requested)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-sm text-gray-900">{formatCurrency(loan.outstanding_balance || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Interest Rate</p>
            <p className="text-sm text-gray-900">{loan.interest_rate || 0}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Term</p>
            <p className="text-sm text-gray-900">{loan.term_months || '--'} months</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Repayment Frequency</p>
            <p className="text-sm text-gray-900">{loan.repayment_frequency || '--'}</p>
          </div>
        </div>
      </Card>

      <AmortizationSchedule schedule={loan.repayment_schedule || []} />
    </div>
  )
}

export default LoanDetails
