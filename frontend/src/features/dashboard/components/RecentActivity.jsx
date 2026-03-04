import React from 'react'
import { Card } from '@components/ui'
import { formatRelativeTime } from '@utils/formatters'
import { t } from '../../../core/i18n/i18n'

const RecentActivity = ({ items = [] }) => (
  <Card className="border border-slate-200 bg-white shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
      {t('dashboard.activity.title', 'Recent Activity')}
    </h3>

    {items.length === 0 ? (
      <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
        {t('dashboard.activity.empty', 'No recent activity in the selected window.')}
      </p>
    ) : (
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <time className="text-xs text-slate-500">{formatRelativeTime(item.time)}</time>
            </div>
            <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    )}
  </Card>
)

export default RecentActivity
