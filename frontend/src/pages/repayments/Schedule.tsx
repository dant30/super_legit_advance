import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { repaymentsAPI } from '@/lib/api/repayments'
import { Card } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function RepaymentSchedule() {
  const [searchParams] = useSearchParams()
  const loanId = searchParams.get('loan_id')
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null)

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', loanId],
    queryFn: () => repaymentsAPI.getSchedules(Number(loanId!)),
    enabled: !!loanId,
  })

  if (!loanId) {
    return <EmptyState title="No loan selected" description="Please select a loan to view its repayment schedule" />
  }

  if (isLoading) return <Loading />

  const scheduleList = schedule?.results || []

  const stats = {
    total: scheduleList.length,
    completed: scheduleList.filter(s => s.status === 'PAID').length,
    pending: scheduleList.filter(s => s.status === 'PENDING').length,
    overdue: scheduleList.filter(s => s.is_overdue).length,
    totalAmount: scheduleList.reduce((sum, s) => sum + s.total_amount, 0),
    totalPaid: scheduleList.reduce((sum, s) => sum + s.amount_paid, 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'OVERDUE':
        return 'danger'
      case 'SKIPPED':
        return 'neutral'
      default:
        return 'info'
    }
  }

  return (
    <>
      <Helmet>
        <title>Repayment Schedule | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Repayment Schedule</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loan #{loanId}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Installments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Completed</p>
            <p className="text-2xl font-bold text-success-600 mt-1">{stats.completed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Pending</p>
            <p className="text-2xl font-bold text-warning-600 mt-1">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Overdue</p>
            <p className="text-2xl font-bold text-danger-600 mt-1">{stats.overdue}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Paid</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">KES {(stats.totalPaid / 1000).toFixed(0)}K</p>
          </Card>
        </div>

        {/* Schedule Table */}
        {scheduleList.length > 0 ? (
          <Card>
            <Table>
              <thead>
                <tr>
                  <th className="w-12"></th>
                  <th>Installment</th>
                  <th>Due Date</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduleList.map((item, index) => (
                  <tbody key={item.id}>
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setExpandedSchedule(expandedSchedule === item.id ? null : item.id)}
                    >
                      <td>
                        <ChevronDown
                          className={`h-4 w-4 transition ${expandedSchedule === item.id ? 'rotate-180' : ''}`}
                        />
                      </td>
                      <td className="font-semibold">#{item.installment_number}</td>
                      <td>{new Date(item.due_date).toLocaleDateString()}</td>
                      <td>KES {item.principal_amount.toLocaleString()}</td>
                      <td>KES {item.interest_amount.toLocaleString()}</td>
                      <td className="font-semibold">KES {item.total_amount.toLocaleString()}</td>
                      <td className="text-success-600">KES {item.amount_paid.toLocaleString()}</td>
                      <td className="text-warning-600">KES {item.amount_outstanding.toLocaleString()}</td>
                      <td>
                        <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedSchedule === item.id && (
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <td colSpan={9} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Payment Percentage</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{item.payment_percentage.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Days Overdue</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{item.days_overdue} days</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Late Fee</p>
                              <p className="font-semibold text-danger-600">KES {item.late_fee.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Remaining Balance</p>
                              <p className="font-semibold text-gray-900 dark:text-white">KES {item.remaining_balance.toLocaleString()}</p>
                            </div>
                          </div>

                            {item.is_adjusted && (
                              <div className="mt-3 p-3 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded text-sm text-info-700 dark:text-info-200">
                                <span className="font-semibold">Adjusted:</span> {item.adjustment_reason}
                              </div>
                            )}

                            {item.notes && (
                              <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Notes:</span> {item.notes}
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
        ) : (
          <EmptyState title="No schedule found" description="This loan does not have a repayment schedule yet" />
        )}
      </div>
    </>
  )
}