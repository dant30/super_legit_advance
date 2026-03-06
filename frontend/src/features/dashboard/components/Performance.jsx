import React from 'react'
import Card from '@components/ui/Card'
import ProgressBar from '@components/ui/ProgressBar'
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import { t } from '../../../core/i18n/i18n'

const PIE_COLORS = ['#0f766e', '#1d4ed8', '#a16207', '#475569']

const Performance = ({ metrics = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }} aria-hidden="true">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-36 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`performance-skeleton-${i}`} className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="mb-2 h-3 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-2 w-full animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const data =
    metrics.length > 0
      ? metrics
      : [
          { label: 'Collections Target', value: 0, variant: 'success' },
          { label: 'Loan Portfolio Health', value: 0, variant: 'info' },
          { label: 'Approval Throughput', value: 0, variant: 'warning' },
        ]

  const chartData = data.map((metric) => ({
    name: metric.label,
    value: Math.max(Number(metric.value || 0), 0),
  }))
  const hasChartData = chartData.some((item) => item.value > 0)

  return (
    <Card className="animate-fade-in border bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium" style={{ borderColor: 'var(--surface-border)' }}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {t('dashboard.performance.title', 'Performance')}
      </h3>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-2">
        {hasChartData ? (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`dashboard-pie-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-slate-500">
            {t('dashboard.performance.noChartData', 'No chart data available yet.')}
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {data.map((metric) => (
          <li key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft">
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
