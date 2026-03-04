import React from 'react'
import { Button, Card } from '@components/ui'
import ProgressBar from '@components/ui/ProgressBar'
import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { t } from '../../../core/i18n/i18n'

const Collections = ({ summary }) => {
  const data = {
    collected: summary?.collected || 'KES 0',
    target: summary?.target || 'KES 0',
    rate: Number(summary?.rate || 0),
    dueToday: Number(summary?.dueToday || 0),
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
          {t('dashboard.collections.title', 'Collections')}
        </h3>
        <Link to={APP_ROUTES.collectionReport}>
          <Button size="sm" variant="outline">
            {t('dashboard.collections.openReport', 'Open report')}
          </Button>
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {t('dashboard.collections.collected', 'Collected')}
            </p>
            <p className="text-lg font-semibold text-slate-900">{data.collected}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500">
              {t('dashboard.collections.target', 'Target')}
            </p>
            <p className="text-sm font-medium text-slate-700">{data.target}</p>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar
            value={data.rate}
            size="md"
            variant="success"
            aria-label="Collection performance"
          />
        </div>
        <p className="mt-2 text-xs text-slate-600">
          {data.rate}% {t('dashboard.collections.achieved', 'of target achieved')}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {t('dashboard.collections.dueToday', 'Due Today')}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {data.dueToday} {t('dashboard.collections.repaymentsSuffix', 'repayments')}
          </p>
        </div>
        <Link to={APP_ROUTES.overdueRepayments}>
          <Button size="sm" variant="primary">
            {t('dashboard.collections.openQueue', 'Open queue')}
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default Collections
