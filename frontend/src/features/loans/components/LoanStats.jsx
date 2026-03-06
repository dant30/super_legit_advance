// frontend/src/components/loans/LoanStats.jsx
import React from 'react'
import { FileSpreadsheet, Wallet, AlertTriangle, CreditCard } from 'lucide-react'
import { formatCurrency } from '@api/loans'

const LoanStats = ({ stats, loading = false }) => {
  const summary = stats?.summary || {}
  const cards = [
    {
      key: 'total',
      title: 'Total Loans',
      value: Number(summary.total_loans || 0).toLocaleString(),
      helper: 'All originated loan records',
      icon: FileSpreadsheet,
      valueClass: 'text-brand-700',
    },
    {
      key: 'active',
      title: 'Active Loans',
      value: Number(summary.total_active_loans || 0).toLocaleString(),
      helper: 'Currently serviced facilities',
      icon: CreditCard,
      valueClass: 'text-feedback-success',
    },
    {
      key: 'overdue',
      title: 'Overdue Loans',
      value: Number(summary.total_overdue_loans || 0).toLocaleString(),
      helper: 'Accounts requiring collection follow-up',
      icon: AlertTriangle,
      valueClass: 'text-feedback-danger',
    },
    {
      key: 'outstanding',
      title: 'Outstanding Balance',
      value: formatCurrency(summary.total_outstanding_balance || 0),
      helper: 'Remaining principal across active book',
      icon: Wallet,
      valueClass: 'text-brand-700',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, index) => (
        <article
          key={item.key}
          className="rounded-xl border bg-surface-panel p-5 shadow-soft transition-all duration-200 hover:shadow-medium animate-fade-in"
          style={{
            borderColor: 'var(--surface-border)',
            animationDelay: `${index * 40}ms`,
            animationFillMode: 'both',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{item.title}</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
              <item.icon className="h-4 w-4" />
            </span>
          </div>

          {loading ? (
            <div className="mt-3 h-8 w-28 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className={`mt-3 text-2xl font-semibold leading-none ${item.valueClass}`}>{item.value}</p>
          )}
          <p className="mt-2 text-xs text-text-muted">{item.helper}</p>
        </article>
      ))}
    </div>
  )
}

export default LoanStats
