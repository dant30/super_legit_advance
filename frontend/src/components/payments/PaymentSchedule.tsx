import { useState } from 'react'
import { Calendar, ChevronDown, AlertCircle } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import { RepaymentSchedule } from '@/lib/api/repayments'

interface PaymentScheduleProps {
  schedule: RepaymentSchedule[]
}

export default function PaymentScheduleComponent({ schedule }: PaymentScheduleProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'OVERDUE':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  if (schedule.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">No payment schedule available</p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <th className="w-12"></th>
            <th>Installment</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Outstanding</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item) => (
            <tbody key={item.id}>
              <tr
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <td>
                  <ChevronDown
                    className={`h-4 w-4 transition ${expandedId === item.id ? 'rotate-180' : ''}`}
                  />
                </td>
                <td className="font-semibold">#{item.installment_number}</td>
                <td>{new Date(item.due_date).toLocaleDateString()}</td>
                <td>KES {item.total_amount.toLocaleString()}</td>
                <td className="text-success-600">KES {item.amount_paid.toLocaleString()}</td>
                <td className="text-warning-600">KES {item.amount_outstanding.toLocaleString()}</td>
                <td>
                  <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                </td>
              </tr>

              {expandedId === item.id && (
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td colSpan={7} className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Principal</p>
                          <p className="font-semibold">KES {item.principal_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Interest</p>
                          <p className="font-semibold">KES {item.interest_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Payment %</p>
                          <p className="font-semibold">{item.payment_percentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Remaining</p>
                          <p className="font-semibold">KES {item.remaining_balance.toLocaleString()}</p>
                        </div>
                      </div>

                      {item.is_overdue && (
                        <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded flex items-center gap-2 text-danger-700 dark:text-danger-200">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{item.days_overdue} days overdue</span>
                        </div>
                      )}

                      {item.is_adjusted && (
                        <div className="p-3 bg-info-50 dark:bg-info-900/20 rounded text-sm text-info-700 dark:text-info-200">
                          <span className="font-semibold">Adjusted:</span> {item.adjustment_reason}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}