// frontend/src/components/loans/AmortizationSchedule.jsx
import React from 'react'
import { Card } from '@components/ui'
import { formatCurrency } from '@api/loans'

const AmortizationSchedule = ({ schedule = [] }) => {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900">Repayment Schedule</h3>
      {schedule.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No schedule available.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Amount Due</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Paid</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Balance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {schedule.map((row) => (
                <tr key={row.id || row.installment_number}>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.installment_number}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.due_date}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{formatCurrency(row.amount_due)}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{formatCurrency(row.paid_amount || 0)}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{formatCurrency(row.balance || 0)}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default AmortizationSchedule
