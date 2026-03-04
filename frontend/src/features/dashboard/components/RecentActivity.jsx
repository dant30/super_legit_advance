import React from 'react'
import { Card } from '@components/ui'

const RecentActivity = ({ items = [] }) => {
  const data = items.length > 0 ? items : [
    { id: 1, title: 'Payment received', detail: 'KES 12,000 from Mary W.', time: '2h ago' },
    { id: 2, title: 'Loan approved', detail: 'Loan LN-1022 for Peter O.', time: '5h ago' },
    { id: 3, title: 'Customer updated', detail: 'Amina S. changed phone number', time: 'Yesterday' },
  ]

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      <div className="mt-3 space-y-3">
        {data.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentActivity
