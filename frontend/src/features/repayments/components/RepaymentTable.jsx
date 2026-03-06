import React from 'react'
import Table from '@components/ui/Table'
import Badge from '@components/ui/Badge'
import Button from '@components/ui/Button'
import { REPAYMENT_STATUS } from '../types'
import { cn } from '@utils/cn'

const RepaymentTable = ({
  data = [],
  loading = false,
  onView,
  onEdit,
  onProcess,
  onWaive,
  onCancel,
  onDelete,
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

  const lifecycleStatus = (status) => String(status || '').toUpperCase()
  const canProcess = (status) => ['PENDING', 'PARTIAL', 'OVERDUE', 'FAILED'].includes(lifecycleStatus(status))
  const canWaive = (status) => !['WAIVED', 'CANCELLED', 'COMPLETED'].includes(lifecycleStatus(status))
  const canCancel = (status) => !['WAIVED', 'CANCELLED', 'COMPLETED'].includes(lifecycleStatus(status))
  const canDelete = (status) => !['COMPLETED'].includes(lifecycleStatus(status))

  const columns = [
    { key: 'repayment_number', header: 'Repayment #' },
    {
      key: 'loan_number',
      header: 'Loan',
      render: (row) => row?.loan_number || row?.loan?.loan_number || 'N/A',
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row?.customer_name || row?.customer?.full_name || row?.customer?.name || 'N/A',
    },
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onView ? (
            <Button size="xs" variant="outline" onClick={() => onView(row)}>
              View
            </Button>
          ) : null}
          {onEdit && canCancel(row?.status) ? (
            <Button size="xs" variant="outline" onClick={() => onEdit(row)}>
              Edit
            </Button>
          ) : null}
          {onProcess && canProcess(row?.status) ? (
            <Button size="xs" variant="primary" onClick={() => onProcess(row)}>
              Process
            </Button>
          ) : null}
          {onWaive && canWaive(row?.status) ? (
            <Button size="xs" variant="warning" onClick={() => onWaive(row)}>
              Waive
            </Button>
          ) : null}
          {onCancel && canCancel(row?.status) ? (
            <Button size="xs" variant="danger" onClick={() => onCancel(row)}>
              Cancel
            </Button>
          ) : null}
          {onDelete && canDelete(row?.status) ? (
            <Button size="xs" variant="ghost" onClick={() => onDelete(row)}>
              Delete
            </Button>
          ) : null}
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
