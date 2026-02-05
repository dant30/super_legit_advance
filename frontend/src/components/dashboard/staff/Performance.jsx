import React from 'react'
import { Card } from '@components/ui'
import ProgressBar from '@components/shared/ProgressBar'

const Performance = ({ metrics }) => {
  const data = metrics || [
    { label: 'Collections Target', value: 82, variant: 'success' },
    { label: 'Customer Follow-ups', value: 68, variant: 'info' },
    { label: 'Loan Reviews', value: 54, variant: 'warning' },
  ]

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
      <div className="mt-4 space-y-4">
        {data.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{metric.label}</span>
              <span className="font-medium text-gray-900">{metric.value}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={metric.value} size="sm" variant={metric.variant} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default Performance
