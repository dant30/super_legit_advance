import React from 'react'
import { Button, Card } from '@components/ui'
import { Link } from 'react-router-dom'

const riskStyles = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

const MyCustomers = ({ customers = [] }) => {
  const data = customers.length > 0 ? customers : [
    { id: 'CU-4401', name: 'Paul N.', risk: 'low', last: 'Today 10:40' },
    { id: 'CU-4402', name: 'Amina S.', risk: 'medium', last: 'Yesterday 16:12' },
    { id: 'CU-4403', name: 'Ken M.', risk: 'high', last: 'Feb 03 11:05' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">My Customers</h3>
        <Link to="/customers">
          <Button size="sm" variant="outline">View all</Button>
        </Link>
      </div>
      <div className="mt-3 divide-y">
        {data.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
              <p className="text-xs text-gray-500">{customer.id} · Last activity {customer.last}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${riskStyles[customer.risk] || riskStyles.low}`}>
              {customer.risk} risk
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default MyCustomers
