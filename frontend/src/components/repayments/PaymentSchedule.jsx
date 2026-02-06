// frontend/src/components/repayments/PaymentSchedule.jsx
import React from 'react'
import Table from '@components/ui/Table'
import Badge from '@components/ui/Badge'

const PaymentSchedule = ({ items = [], loading = false }) => {
  const statusVariant = (status) => {
    const s = String(status || '').toUpperCase()
    if (s === 'PAID' || s === 'COMPLETED') return 'success'
    if (s === 'PENDING') return 'warning'
    if (s === 'OVERDUE') return 'danger'
    return 'secondary'
  }

  const columns = [
    { key: 'installment_number', header: '#', align: 'center' },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (row) => (row?.due_date ? new Date(row.due_date).toLocaleDateString() : '-'),
    },
    { key: 'amount_due', header: 'Amount Due', align: 'right' },
    { key: 'amount_paid', header: 'Amount Paid', align: 'right' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={statusVariant(row?.status)}>{row?.status}</Badge>,
    },
  ]

  return <Table columns={columns} data={items} loading={loading} emptyMessage="No schedule items" />
}

export default PaymentSchedule
