// frontend/src/components/repayments/RepaymentStats.jsx
import React from 'react'
import { Card, CardContent } from '@components/ui/Card'
import { cn } from '@utils/cn'

const Stat = ({ label, value, className }) => (
  <div
    className={cn(
      'rounded-xl border bg-surface-panel p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium',
      className
    )}
    style={{ borderColor: 'var(--surface-border)' }}
  >
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
    <p className="mt-2 text-xl font-semibold text-text-primary">{value}</p>
  </div>
)

const RepaymentStats = ({ stats }) => {
  if (!stats) return null

  const counts = stats.counts || {}
  const amounts = stats.amounts || {}

  return (
    <Card className="border bg-white shadow-soft" style={{ borderColor: 'var(--surface-border)' }}>
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Total" value={counts.total ?? 0} />
          <Stat label="Completed" value={counts.completed ?? 0} />
          <Stat label="Pending" value={counts.pending ?? 0} />
          <Stat label="Overdue" value={counts.overdue ?? 0} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
          <Stat label="Total Due" value={amounts.total_due ?? 0} />
          <Stat label="Total Paid" value={amounts.total_paid ?? 0} />
          <Stat label="Outstanding" value={amounts.total_outstanding ?? 0} />
        </div>
      </CardContent>
    </Card>
  )
}

export default RepaymentStats
