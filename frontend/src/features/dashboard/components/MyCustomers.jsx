import React from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@utils/formatters'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { t } from '../../../core/i18n/i18n'

const riskStyles = {
  low: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
}

const MyCustomers = ({ customers = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }} aria-hidden="true">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border bg-slate-50/70 p-3" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
          <div className="ml-auto h-8 w-20 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`customers-skeleton-${i}`} className="h-14 animate-pulse rounded-lg border bg-slate-100" style={{ borderColor: 'var(--surface-border)' }} />
          ))}
        </div>
      </Card>
    )
  }

  const data = customers.map((customer) => {
    const fullName =
      customer?.full_name ||
      customer?.name ||
      customer?.customer_name ||
      t('dashboard.customers.fallbackBorrower', 'Borrower')
    const publicId = customer?.customer_number || customer?.id_number || `CU-${customer?.id || '--'}`
    const risk = String(customer?.risk_level || customer?.risk_profile || 'low').toLowerCase()
    const lastEvent = customer?.last_activity_at || customer?.updated_at || customer?.created_at

    return {
      id: customer?.id || publicId,
      fullName,
      publicId,
      risk: riskStyles[risk] ? risk : 'low',
      lastEvent,
    }
  })
  const highRiskCount = data.filter((customer) => customer.risk === 'high').length

  return (
    <Card className="animate-fade-in border bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium" style={{ borderColor: 'var(--surface-border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {t('dashboard.customers.title', 'My Borrowers')}
        </h3>
        <Link to={APP_ROUTES.customers}>
          <Button size="sm" variant="outline">
            {t('dashboard.customers.viewAll', 'View all borrowers')}
          </Button>
        </Link>
      </div>
      <div
        className="mt-3 grid grid-cols-2 gap-2 rounded-lg border bg-slate-50/70 p-3"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
            {t('dashboard.customers.kpiTotal', 'Assigned')}
          </p>
          <p className="text-sm font-semibold text-slate-900">{data.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
            {t('dashboard.customers.kpiHighRisk', 'High Risk')}
          </p>
          <p className="text-sm font-semibold text-rose-700">{highRiskCount}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p
          className="mt-3 rounded-lg border border-dashed bg-slate-50 px-3 py-4 text-sm text-slate-600"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          {t('dashboard.customers.empty', 'No borrower records assigned yet.')}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {data.map((customer) => (
            <li
              key={customer.id}
              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
              style={{ borderColor: 'var(--surface-border)' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{customer.fullName}</p>
                <p className="truncate text-xs text-slate-500">
                  {customer.publicId} - {t('dashboard.customers.lastActivity', 'Last activity')}{' '}
                  {formatDateTime(customer.lastEvent)}
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${riskStyles[customer.risk]}`}>
                {t(`dashboard.customers.risks.${customer.risk}`, customer.risk)}{' '}
                {t('dashboard.customers.riskSuffix', 'risk')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default MyCustomers
