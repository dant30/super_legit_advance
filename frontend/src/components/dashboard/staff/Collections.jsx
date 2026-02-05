import React from 'react'
import { Button, Card } from '@components/ui'
import ProgressBar from '@components/shared/ProgressBar'

const Collections = ({ summary }) => {
  const data = summary || {
    collected: 'KES 420,000',
    target: 'KES 520,000',
    rate: 81,
    dueToday: 12,
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Collections</h3>
        <Button size="sm" variant="outline">View report</Button>
      </div>
      <div className="mt-4 rounded-lg border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Collected</p>
            <p className="text-lg font-semibold text-gray-900">{data.collected}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-sm font-medium text-gray-700">{data.target}</p>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={data.rate} size="md" variant="success" />
        </div>
        <p className="mt-2 text-xs text-gray-500">{data.rate}% of target achieved</p>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-100 p-3">
        <div>
          <p className="text-xs text-gray-500">Due Today</p>
          <p className="text-sm font-semibold text-gray-900">{data.dueToday} repayments</p>
        </div>
        <Button size="sm" variant="primary">Collect now</Button>
      </div>
    </Card>
  )
}

export default Collections
