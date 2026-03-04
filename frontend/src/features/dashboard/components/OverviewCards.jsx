import React, { useMemo } from 'react'
import { Users, CreditCard, Wallet, TrendingUp } from 'lucide-react'
import { formatNumber } from '@utils/formatters'
import { t } from '../../../core/i18n/i18n'

const StatCard = ({ title, value, icon: Icon, helper }) => (
  <article className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-colors hover:border-slate-300">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <span className="rounded-md bg-slate-100 p-2 text-slate-700">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
    <p className="text-2xl font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{helper}</p>
  </article>
)

const OverviewCards = ({ stats }) => {
  const items = useMemo(() => ([
    {
      title: t('dashboard.overview.borrowersTitle', 'Borrowers'),
      value: formatNumber(stats?.customers),
      icon: Users,
      helper: t('dashboard.overview.borrowersHelper', 'Managed borrower accounts'),
    },
    {
      title: t('dashboard.overview.activeLoansTitle', 'Active Loans'),
      value: formatNumber(stats?.activeLoans),
      icon: CreditCard,
      helper: t('dashboard.overview.activeLoansHelper', 'Currently disbursed facilities'),
    },
    {
      title: t('dashboard.overview.dueTodayTitle', 'Due Today'),
      value: formatNumber(stats?.dueToday),
      icon: Wallet,
      helper: t('dashboard.overview.dueTodayHelper', 'Repayments requiring collection'),
    },
    {
      title: t('dashboard.overview.collectionRateTitle', 'Collection Rate'),
      value: `${formatNumber(stats?.collectionRate)}%`,
      icon: TrendingUp,
      helper: t('dashboard.overview.collectionRateHelper', 'Portfolio recovery performance'),
    },
  ]), [stats])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  )
}

export default OverviewCards
