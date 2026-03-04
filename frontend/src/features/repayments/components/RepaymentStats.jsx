// frontend/src/components/repayments/RepaymentStats.jsx
import React from 'react'
import { Card, CardContent } from '@components/ui/Card'
import { cn } from '@utils/cn'

const Stat = ({ label, value, className }) => (
  <div className={cn('p-4 rounded-lg border border-gray-200 dark:border-slate-700', className)}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
)

const RepaymentStats = ({ stats }) => {
  if (!stats) return null

  const counts = stats.counts || {}
  const amounts = stats.amounts || {}

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total" value={counts.total ?? 0} />
          <Stat label="Completed" value={counts.completed ?? 0} />
          <Stat label="Pending" value={counts.pending ?? 0} />
          <Stat label="Overdue" value={counts.overdue ?? 0} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Stat label="Total Due" value={amounts.total_due ?? 0} />
          <Stat label="Total Paid" value={amounts.total_paid ?? 0} />
          <Stat label="Outstanding" value={amounts.total_outstanding ?? 0} />
        </div>
      </CardContent>
    </Card>
  )
}

export default RepaymentStats
