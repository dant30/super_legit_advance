import React from 'react'
import { Button, Card } from '@components/ui'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '@utils/formatters'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { t } from '../../../core/i18n/i18n'

const PendingApprovals = ({ approvals = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }} aria-hidden="true">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border bg-slate-50/70 p-3" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
          <div className="ml-auto h-8 w-24 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`approvals-skeleton-${i}`} className="h-14 animate-pulse rounded-lg border bg-slate-100" style={{ borderColor: 'var(--surface-border)' }} />
          ))}
        </div>
      </Card>
    )
  }

  const data = approvals.map((item, index) => ({
    id: item?.id || item?.loan_number || `pending-${index}`,
    borrowerName:
      item?.customer?.full_name ||
      item?.applicant_name ||
      item?.customer_name ||
      t('dashboard.approvals.fallbackBorrower', 'Borrower'),
    amount: Number(item?.requested_amount || item?.loan_amount || item?.amount || 0),
    submittedAt: item?.submitted_at || item?.created_at,
    publicId: item?.loan_number || `APP-${item?.id || '--'}`,
  }))
  const totalPendingAmount = data.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  return (
    <Card className="animate-fade-in border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {t('dashboard.approvals.title', 'Pending Approvals')}
        </h3>
        <Link to={APP_ROUTES.loanApprovals}>
          <Button size="sm" variant="outline">
            {t('dashboard.approvals.review', 'Review approvals')}
          </Button>
        </Link>
      </div>
      <div
        className="mt-3 grid grid-cols-2 gap-2 rounded-lg border bg-slate-50/70 p-3"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
            {t('dashboard.approvals.kpiCount', 'Pending Cases')}
          </p>
          <p className="text-sm font-semibold text-slate-900">{data.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
            {t('dashboard.approvals.kpiValue', 'Pending Value')}
          </p>
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(totalPendingAmount)}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p
          className="mt-3 rounded-lg border border-dashed bg-slate-50 px-3 py-4 text-sm text-slate-600"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          {t('dashboard.approvals.empty', 'No loan applications awaiting approval.')}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {data.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border bg-white px-3 py-2.5"
              style={{ borderColor: 'var(--surface-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.borrowerName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.publicId} - {t('dashboard.approvals.submitted', 'Submitted')}{' '}
                    {formatDateTime(item.submittedAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default PendingApprovals
