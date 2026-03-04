import React from 'react'
import { Card } from '@components/ui'
import ProgressBar from '@components/ui/ProgressBar'
import { t } from '../../../core/i18n/i18n'

const Performance = ({ metrics = [] }) => {
  const data =
    metrics.length > 0
      ? metrics
      : [
          { label: 'Collections Target', value: 0, variant: 'success' },
          { label: 'Loan Portfolio Health', value: 0, variant: 'info' },
          { label: 'Approval Throughput', value: 0, variant: 'warning' },
        ]

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
        {t('dashboard.performance.title', 'Performance')}
      </h3>
      <ul className="mt-4 space-y-4">
        {data.map((metric) => (
          <li key={metric.label}>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{metric.label}</span>
              <span className="font-medium text-slate-900">{Number(metric.value || 0)}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar
                value={Number(metric.value || 0)}
                size="sm"
                variant={metric.variant || 'default'}
                aria-label={`${metric.label} progress`}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default Performance
