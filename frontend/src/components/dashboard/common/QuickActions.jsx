import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'

const QuickActions = ({ actions = [], className, title = 'Quick Actions' }) => {
  return (
    <div className={cn('rounded-xl border bg-white p-4 shadow-sm', className)}>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const content = (
            <div className={cn(
              'flex items-start gap-3 rounded-lg border p-3 transition',
              action.disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50'
            )}>
              {action.icon && (
                <div className="mt-0.5 rounded-md bg-gray-100 p-2 text-gray-700">
                  <action.icon className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
                {action.description && (
                  <p className="text-xs text-gray-500">{action.description}</p>
                )}
              </div>
            </div>
          )

          if (action.to) {
            return (
              <Link key={action.key || action.label} to={action.to} className={action.disabled ? 'pointer-events-none' : ''}>
                {content}
              </Link>
            )
          }

          return (
            <button
              key={action.key || action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className="text-left"
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActions
