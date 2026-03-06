import React from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import ProgressBar from '@components/ui/ProgressBar'
import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { t } from '../../../core/i18n/i18n'

const Collections = ({ summary, loading = false }) => {
  if (loading) {
    return (
      <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }} aria-hidden="true">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 rounded-lg border bg-slate-50/70 p-4" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
            <div className="ml-auto h-8 w-20 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="mt-3 h-2 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200" />
        </div>
      </Card>
    )
  }

  const data = {
    collected: summary?.collected || 'KES 0',
    target: summary?.target || 'KES 0',
    rate: Number(summary?.rate || 0),
    dueToday: Number(summary?.dueToday || 0),
  }

  return (
    <Card className="animate-fade-in border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {t('dashboard.collections.title', 'Collections')}
        </h3>
        <Link to={APP_ROUTES.collectionReport}>
          <Button size="sm" variant="outline">
            {t('dashboard.collections.openReport', 'Open report')}
          </Button>
        </Link>
      </div>

      <div className="mt-4 rounded-lg border bg-slate-50/70 p-4" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="grid grid-cols-2 gap-3">
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

        <div className="col-span-2 mt-1">
          <ProgressBar
            value={data.rate}
            size="md"
            variant="success"
            aria-label="Collection performance"
          />
        </div>
        <p className="col-span-2 mt-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">{data.rate}%</span>{' '}
          {t('dashboard.collections.achieved', 'of target achieved')}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border bg-white p-3" style={{ borderColor: 'var(--surface-border)' }}>
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
