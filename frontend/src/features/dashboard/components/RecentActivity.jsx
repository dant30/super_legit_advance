import React from 'react'
import { Card } from '@components/ui'
import { formatRelativeTime } from '@utils/formatters'
import { t } from '../../../core/i18n/i18n'

const RecentActivity = ({ items = [] }) => (
  <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }}>
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
      {t('dashboard.activity.title', 'Recent Activity')}
    </h3>

    {items.length === 0 ? (
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
            className="rounded-lg border bg-white px-3 py-2.5"
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
