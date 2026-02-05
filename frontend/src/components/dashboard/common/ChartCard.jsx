import React from 'react'
import { cn } from '@utils/cn'

const ChartCard = ({ title, subtitle, action, children, className }) => {
  return (
    <div className={cn('rounded-xl border bg-white p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default ChartCard
