import React from 'react'
import { Button, Card } from '@components/ui'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '@utils/formatters'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { t } from '../../../core/i18n/i18n'

const PendingApprovals = ({ approvals = [] }) => {
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

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
          {t('dashboard.approvals.title', 'Pending Approvals')}
        </h3>
        <Link to={APP_ROUTES.loanApprovals}>
          <Button size="sm" variant="outline">
            {t('dashboard.approvals.review', 'Review approvals')}
          </Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
          {t('dashboard.approvals.empty', 'No loan applications awaiting approval.')}
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {data.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.borrowerName}</p>
                  <p className="text-xs text-slate-500">
                    {item.publicId} | {t('dashboard.approvals.submitted', 'Submitted')}{' '}
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
