import React from 'react'
import { Badge, Button, Card } from '@components/ui'
import { Link } from 'react-router-dom'

const statusStyles = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-700',
}

const MyLoans = ({ loans = [] }) => {
  const data = loans.length > 0 ? loans : [
    { id: 'LN-1021', customer: 'Mary W.', amount: 'KES 48,000', status: 'active', due: 'Feb 08' },
    { id: 'LN-1022', customer: 'Peter O.', amount: 'KES 120,000', status: 'pending', due: 'Feb 10' },
    { id: 'LN-1023', customer: 'Joy K.', amount: 'KES 26,500', status: 'overdue', due: 'Feb 01' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">My Loans</h3>
        <Link to="/loans">
          <Button size="sm" variant="outline">View all</Button>
        </Link>
      </div>
      <div className="mt-3 divide-y">
        {data.map((loan) => (
          <div key={loan.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{loan.customer}</p>
              <p className="text-xs text-gray-500">{loan.id} · Due {loan.due}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">{loan.amount}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[loan.status] || statusStyles.active}`}>
                {loan.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default MyLoans
