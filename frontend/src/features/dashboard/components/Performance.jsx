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
    <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {t('dashboard.performance.title', 'Performance')}
      </h3>
      <ul className="mt-4 space-y-3">
        {data.map((metric) => (
          <li key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-slate-700">{metric.label}</span>
              <span className="font-semibold text-slate-900">{Number(metric.value || 0)}%</span>
            </div>
            <ProgressBar
              value={Number(metric.value || 0)}
              size="sm"
              variant={metric.variant || 'default'}
              aria-label={`${metric.label} progress`}
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default Performance
