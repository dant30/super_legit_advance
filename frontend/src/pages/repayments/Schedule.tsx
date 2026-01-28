import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

import { repaymentsAPI } from '@/lib/api/repayments'
import { Card } from '@/components/ui/Card'
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

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'primary' => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'OVERDUE':
        return 'danger'
      case 'SKIPPED':
        return 'primary'
      default:
        return 'primary'
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="w-12"></th>
                    <th className="px-4 py-3 text-left font-semibold">Installment</th>
                    <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Principal</th>
                    <th className="px-4 py-3 text-left font-semibold">Interest</th>
                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Paid</th>
                    <th className="px-4 py-3 text-left font-semibold">Outstanding</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {scheduleList.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                        onClick={() =>
                          setExpandedSchedule(
                            expandedSchedule === item.id ? null : item.id
                          )
                        }
                      >
                        <td className="px-4 py-3">
                          <ChevronDown
                            className={`h-4 w-4 transition ${
                              expandedSchedule === item.id ? 'rotate-180' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold">#{item.installment_number}</td>
                        <td className="px-4 py-3">{new Date(item.due_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">KES {item.principal_amount.toLocaleString()}</td>
                        <td className="px-4 py-3">KES {item.interest_amount.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold">
                          KES {item.total_amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-success-600">
                          KES {item.amount_paid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-warning-600">
                          KES {item.amount_outstanding.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>

                      {expandedSchedule === item.id && (
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <td colSpan={9} className="p-4">
                            {/* expanded content */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Payment Date</p>
                                <p className="font-medium">{item.payment_date ? new Date(item.payment_date).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Days Overdue</p>
                                <p className="font-medium">{item.days_overdue}</p>
                              </div>
                              {item.adjustment_reason && (
                                <div className="col-span-2">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Adjustment Reason</p>
                                  <p className="font-medium">{item.adjustment_reason}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState title="No schedule found" description="No repayment schedule available for this loan" />
        )}
      </div>
    </>
  )
}