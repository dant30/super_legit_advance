import React from 'react'
import { cn } from '@utils/cn'

const accentClasses = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200',
}

const deltaClasses = {
  up: 'text-success-700 bg-success-50 border-success-200',
  down: 'text-danger-700 bg-danger-50 border-danger-200',
  flat: 'text-gray-700 bg-gray-50 border-gray-200',
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  deltaDirection = 'flat',
  accent = 'primary',
  className,
}) => {
  return (
    <div className={cn('rounded-xl border bg-white p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        {Icon && (
          <div className={cn('rounded-lg border p-2', accentClasses[accent] || accentClasses.primary)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(delta || deltaLabel) && (
        <div className="mt-3 flex items-center gap-2">
          {delta && (
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', deltaClasses[deltaDirection])}>
              {delta}
            </span>
          )}
          {deltaLabel && <span className="text-xs text-gray-500">{deltaLabel}</span>}
        </div>
      )}
    </div>
  )
}

export default StatCard
