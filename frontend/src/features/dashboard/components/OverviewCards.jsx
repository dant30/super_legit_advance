import React, { useMemo } from 'react'
import { Users, CreditCard, Wallet, TrendingUp } from 'lucide-react'
import { formatNumber } from '@utils/formatters'
import { t } from '../../../core/i18n/i18n'

const metricTone = (value, type) => {
  if (type === 'collectionRate') {
    if (value >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (value >= 65) return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-rose-700 bg-rose-50 border-rose-200'
  }
  return 'text-slate-700 bg-slate-50 border-slate-200'
}

const StatCard = ({ title, value, icon: Icon, helper, type, rawValue }) => (
  <article
    className="rounded-xl border bg-white px-4 py-4 shadow-sm transition-colors hover:border-slate-300"
    style={{ borderColor: 'var(--surface-border)' }}
  >
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</p>
      <span className="rounded-md bg-slate-100 p-2 text-slate-700">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
    <div className="flex items-end justify-between gap-3">
      <p className="text-2xl font-semibold leading-none text-slate-900">{value}</p>
      {type === 'collectionRate' && (
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${metricTone(
            Number(rawValue || 0),
            type
          )}`}
        >
          {Number(rawValue || 0) >= 85 ? 'Strong' : Number(rawValue || 0) >= 65 ? 'Watch' : 'Risk'}
        </span>
      )}
    </div>
    <p className="mt-2 text-xs text-slate-500">{helper}</p>
    {type === 'collectionRate' && (
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, Number(rawValue || 0)))}%` }}
        />
      </div>
    )}
  </article>
)

const OverviewCards = ({ stats }) => {
  const collectionRate = Number(stats?.collectionRate || 0)
  const items = useMemo(() => ([
    {
      title: t('dashboard.overview.borrowersTitle', 'Borrowers'),
      value: formatNumber(stats?.customers),
      icon: Users,
      helper: t('dashboard.overview.borrowersHelper', 'Managed borrower accounts'),
      type: 'customers',
      rawValue: Number(stats?.customers || 0),
    },
    {
      title: t('dashboard.overview.activeLoansTitle', 'Active Loans'),
      value: formatNumber(stats?.activeLoans),
      icon: CreditCard,
      helper: t('dashboard.overview.activeLoansHelper', 'Currently disbursed facilities'),
      type: 'activeLoans',
      rawValue: Number(stats?.activeLoans || 0),
    },
    {
      title: t('dashboard.overview.dueTodayTitle', 'Due Today'),
      value: formatNumber(stats?.dueToday),
      icon: Wallet,
      helper: t('dashboard.overview.dueTodayHelper', 'Repayments requiring collection'),
      type: 'dueToday',
      rawValue: Number(stats?.dueToday || 0),
    },
    {
      title: t('dashboard.overview.collectionRateTitle', 'Collection Rate'),
      value: `${collectionRate.toFixed(1)}%`,
      icon: TrendingUp,
      helper: t('dashboard.overview.collectionRateHelper', 'Portfolio recovery performance'),
      type: 'collectionRate',
      rawValue: collectionRate,
    },
  ]), [stats, collectionRate])

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  )
}

export default OverviewCards
