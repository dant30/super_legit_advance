import React, { useMemo } from 'react'
import { Users, CreditCard, Wallet, TrendingUp } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, delta, deltaLabel }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <Icon className="h-5 w-5 text-primary-600" />
    </div>
    <p className="mt-2 text-xs text-gray-500">
      <span className="font-semibold text-gray-700">{delta}</span> {deltaLabel}
    </p>
  </div>
)

const OverviewCards = ({ stats }) => {
  const items = useMemo(() => ([
    {
      title: 'Assigned Customers',
      value: stats?.customers ?? 128,
      icon: Users,
      delta: '+6.2%',
      deltaLabel: 'vs last week',
      deltaDirection: 'up',
      accent: 'primary',
    },
    {
      title: 'Active Loans',
      value: stats?.activeLoans ?? 54,
      icon: CreditCard,
      delta: '+2.1%',
      deltaLabel: 'vs last week',
      deltaDirection: 'up',
      accent: 'info',
    },
    {
      title: 'Due Today',
      value: stats?.dueToday ?? 12,
      icon: Wallet,
      delta: '-3.4%',
      deltaLabel: 'vs yesterday',
      deltaDirection: 'down',
      accent: 'warning',
    },
    {
      title: 'Collection Rate',
      value: `${stats?.collectionRate ?? 92}%`,
      icon: TrendingUp,
      delta: '+1.3%',
      deltaLabel: 'this month',
      deltaDirection: 'up',
      accent: 'success',
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
