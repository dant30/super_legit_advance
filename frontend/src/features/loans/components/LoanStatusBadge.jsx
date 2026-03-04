// frontend/src/components/loans/LoanStatusBadge.jsx
import React from 'react'
import { cn } from '@utils/cn'
import { getLoanStatusColor, LOAN_STATUS_LABELS } from '@api/loans'

const colorClasses = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  error: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-700',
  info: 'bg-blue-100 text-blue-700',
}

const LoanStatusBadge = ({ status, className }) => {
  const color = getLoanStatusColor(status)
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', colorClasses[color] || colorClasses.default, className)}>
      {LOAN_STATUS_LABELS[status] || status || 'Unknown'}
    </span>
  )
}

export default LoanStatusBadge
