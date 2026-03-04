// frontend/src/components/repayments/RepaymentDetails.jsx
import React from 'react'
import { Card, CardHeader, CardContent } from '@components/ui/Card'
import Badge from '@components/ui/Badge'
import Button from '@components/ui/Button'
import { REPAYMENT_STATUS } from '@api/repayments'

const RepaymentDetails = ({
  repayment,
  onProcess,
  onWaive,
  onCancel,
  formatCurrency,
  formatStatus,
}) => {
  if (!repayment) return null

  const statusVariant = (status) => {
    switch (status) {
      case REPAYMENT_STATUS.COMPLETED:
        return 'success'
      case REPAYMENT_STATUS.PENDING:
      case REPAYMENT_STATUS.PARTIAL:
      case REPAYMENT_STATUS.PROCESSING:
        return 'warning'
      case REPAYMENT_STATUS.OVERDUE:
        return 'danger'
      case REPAYMENT_STATUS.FAILED:
      case REPAYMENT_STATUS.CANCELLED:
      case REPAYMENT_STATUS.WAIVED:
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  return (
    <Card>
      <CardHeader
        title={`Repayment ${repayment.repayment_number}`}
        description="Detailed repayment information"
      />
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Loan</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {repayment?.loan?.loan_number || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {repayment?.customer?.full_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount Due</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency ? formatCurrency(repayment.amount_due) : repayment.amount_due}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount Paid</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency ? formatCurrency(repayment.amount_paid) : repayment.amount_paid}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Date</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {repayment.payment_date ? new Date(repayment.payment_date).toLocaleDateString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge variant={statusVariant(repayment.status)}>
              {formatStatus ? formatStatus(repayment.status) : repayment.status}
            </Badge>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {onProcess && (
            <Button onClick={() => onProcess(repayment)} size="sm">
              Process Payment
            </Button>
          )}
          {onWaive && (
            <Button onClick={() => onWaive(repayment)} size="sm" variant="warning">
              Waive Amount
            </Button>
          )}
          {onCancel && (
            <Button onClick={() => onCancel(repayment)} size="sm" variant="danger">
              Cancel Repayment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RepaymentDetails
