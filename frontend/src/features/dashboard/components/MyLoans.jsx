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
      amountLabel: formatCurrency(amount),
      dueLabel: formatDate(dueDate),
      publicId,
    }
  })

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
          {t('dashboard.loans.title', 'My Loans')}
        </h3>
        <Link to={APP_ROUTES.loans}>
          <Button size="sm" variant="outline">
            {t('dashboard.loans.viewAll', 'View all loans')}
          </Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
          {t('dashboard.loans.empty', 'No loan records available.')}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200">
          {data.map((loan) => (
            <li key={loan.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{loan.borrowerName}</p>
                <p className="text-xs text-slate-500">
                  {loan.publicId} | {t('dashboard.loans.due', 'Due')} {loan.dueLabel}
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
