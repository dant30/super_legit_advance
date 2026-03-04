import React from 'react'
import { Button, Card } from '@components/ui'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@utils/formatters'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { t } from '../../../core/i18n/i18n'

const riskStyles = {
  low: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
}

const MyCustomers = ({ customers = [] }) => {
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

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
          {t('dashboard.customers.title', 'My Borrowers')}
        </h3>
        <Link to={APP_ROUTES.customers}>
          <Button size="sm" variant="outline">
            {t('dashboard.customers.viewAll', 'View all borrowers')}
          </Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
          {t('dashboard.customers.empty', 'No borrower records assigned yet.')}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200">
          {data.map((customer) => (
            <li key={customer.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{customer.fullName}</p>
                <p className="text-xs text-slate-500">
                  {customer.publicId} | {t('dashboard.customers.lastActivity', 'Last activity')}{' '}
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
