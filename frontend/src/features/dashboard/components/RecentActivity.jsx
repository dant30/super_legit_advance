import React from 'react'
import Card from '@components/ui/Card'
import { formatRelativeTime } from '@utils/formatters'
import { t } from '../../../core/i18n/i18n'

const RecentActivity = ({ items = [], loading = false }) => (
  <Card className="animate-fade-in border bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium" style={{ borderColor: 'var(--surface-border)' }}>
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
      {t('dashboard.activity.title', 'Recent Activity')}
    </h3>

    {loading ? (
      <div className="mt-3 space-y-2" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`activity-skeleton-${i}`}
            className="h-14 animate-pulse rounded-lg border bg-slate-100"
            style={{ borderColor: 'var(--surface-border)' }}
          />
        ))}
      </div>
    ) : items.length === 0 ? (
      <p
        className="mt-3 rounded-lg border border-dashed bg-slate-50 px-3 py-4 text-sm text-slate-600"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        {t('dashboard.activity.empty', 'No recent activity in the selected window.')}
      </p>
    ) : (
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border bg-white px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
            style={{ borderColor: 'var(--surface-border)' }}
          >
            <div className="flex items-center justify-between">
              <p className="line-clamp-1 text-sm font-medium text-slate-900">{item.title}</p>
              <time className="text-xs text-slate-500">{formatRelativeTime(item.time)}</time>
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    )}
  </Card>
)

export default RecentActivity
