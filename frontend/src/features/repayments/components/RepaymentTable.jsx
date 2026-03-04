// frontend/src/components/repayments/RepaymentTable.jsx
import React from 'react'
import Table from '@components/ui/Table'
import Badge from '@components/ui/Badge'
import Button from '@components/ui/Button'
import { REPAYMENT_STATUS } from '@api/repayments'
import { cn } from '@utils/cn'

const RepaymentTable = ({
  data = [],
  loading = false,
  onView,
  onEdit,
  onProcess,
  onWaive,
  onCancel,
  formatCurrency,
  formatStatus,
  className,
}) => {
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

  const columns = [
    { key: 'repayment_number', header: 'Repayment #' },
    { key: 'loan_number', header: 'Loan', render: (row) => row?.loan?.loan_number || 'N/A' },
    { key: 'customer', header: 'Customer', render: (row) => row?.customer?.full_name || row?.customer?.name || 'N/A' },
    {
      key: 'amount_due',
      header: 'Amount Due',
      align: 'right',
      render: (row) => (formatCurrency ? formatCurrency(row?.amount_due) : row?.amount_due),
    },
    {
      key: 'amount_paid',
      header: 'Amount Paid',
      align: 'right',
      render: (row) => (formatCurrency ? formatCurrency(row?.amount_paid) : row?.amount_paid),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row?.status)}>
          {formatStatus ? formatStatus(row?.status) : row?.status}
        </Badge>
      ),
    },
    {
      key: 'payment_date',
      header: 'Payment Date',
      render: (row) => (row?.payment_date ? new Date(row.payment_date).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {onView && (
            <Button size="xs" variant="outline" onClick={() => onView(row)}>
              View
            </Button>
          )}
          {onEdit && (
            <Button size="xs" variant="outline" onClick={() => onEdit(row)}>
              Edit
            </Button>
          )}
          {onProcess && (
            <Button size="xs" variant="primary" onClick={() => onProcess(row)}>
              Process
            </Button>
          )}
          {onWaive && (
            <Button size="xs" variant="warning" onClick={() => onWaive(row)}>
              Waive
            </Button>
          )}
          {onCancel && (
            <Button size="xs" variant="danger" onClick={() => onCancel(row)}>
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      className={cn(className)}
      emptyMessage="No repayments found"
    />
  )
}

export default RepaymentTable
