import React from 'react'
import { Button, Card } from '@components/ui'

const PendingApprovals = ({ approvals = [] }) => {
  const data = approvals.length > 0 ? approvals : [
    { id: 'LN-1024', name: 'David K.', amount: 'KES 75,000', submitted: 'Today 09:12' },
    { id: 'LN-1025', name: 'Ann L.', amount: 'KES 30,000', submitted: 'Yesterday 15:30' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Pending Approvals</h3>
        <Button size="sm" variant="outline">Review all</Button>
      </div>
      <div className="mt-3 space-y-3">
        {data.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.id} · Submitted {item.submitted}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.amount}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="primary">Approve</Button>
              <Button size="sm" variant="outline">Review</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default PendingApprovals
