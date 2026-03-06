import React from 'react'
import { Button, Card } from '@components/ui'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '@utils/formatters'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { t } from '../../../core/i18n/i18n'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  overdue: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  closed: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
  approved: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
}

const MyLoans = ({ loans = [] }) => {
  const data = loans.map((loan) => {
    const borrowerName =
      loan?.customer?.full_name ||
      loan?.customer_name ||
      t('dashboard.loans.fallbackBorrower', 'Borrower')
    const status = String(loan?.status || 'active').toLowerCase()
    const amount = Number(
      loan?.requested_amount || loan?.principal_amount || loan?.amount || loan?.loan_amount || 0
    )
    const dueDate = loan?.next_payment_date || loan?.due_date || loan?.maturity_date
    const publicId = loan?.loan_number || `LN-${loan?.id || '--'}`

    return {
      id: loan?.id || publicId,
      borrowerName,
      status: statusStyles[status] ? status : 'active',
      amount,
      amountLabel: formatCurrency(amount),
      dueLabel: formatDate(dueDate),
      publicId,
    }
  })
  const overdueCount = data.filter((loan) => loan.status === 'overdue').length
  const totalExposure = data.reduce((sum, loan) => sum + Number(loan.amount || 0), 0)

  return (
    <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {t('dashboard.loans.title', 'My Loans')}
        </h3>
        <Link to={APP_ROUTES.loans}>
          <Button size="sm" variant="outline">
            {t('dashboard.loans.viewAll', 'View all loans')}
          </Button>
        </Link>
      </div>
      <div
        className="mt-3 grid grid-cols-3 gap-2 rounded-lg border bg-slate-50/70 p-3"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
            {t('dashboard.loans.kpiOpen', 'Open')}
          </p>
          <p className="text-sm font-semibold text-slate-900">{data.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
            {t('dashboard.loans.kpiOverdue', 'Overdue')}
          </p>
          <p className="text-sm font-semibold text-rose-700">{overdueCount}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
            {t('dashboard.loans.kpiExposure', 'Exposure')}
          </p>
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(totalExposure)}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p
          className="mt-3 rounded-lg border border-dashed bg-slate-50 px-3 py-4 text-sm text-slate-600"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          {t('dashboard.loans.empty', 'No loan records available.')}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {data.map((loan) => (
            <li
              key={loan.id}
              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2.5"
              style={{ borderColor: 'var(--surface-border)' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{loan.borrowerName}</p>
                <p className="truncate text-xs text-slate-500">
                  {loan.publicId} - {t('dashboard.loans.due', 'Due')} {loan.dueLabel}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">{loan.amountLabel}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusStyles[loan.status]}`}>
                  {t(`dashboard.loans.statuses.${loan.status}`, loan.status)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default MyLoans
