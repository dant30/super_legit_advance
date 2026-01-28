import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Download, Edit, CheckCircle2, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { repaymentsAPI } from '@/lib/api/repayments'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Loading from '@/components/shared/Loading'
import Error from '@/components/shared/Error'

export default function RepaymentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: repayment, isLoading, error } = useQuery({
    queryKey: ['repayment', id],
    queryFn: () => repaymentsAPI.getRepayment(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <Loading />
  if (error) return <Error error={error} />
  if (!repayment) return <Error error={new Error('Repayment not found')} />

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'OVERDUE':
        return 'danger'
      case 'PARTIAL':
        return 'info'
      default:
        return 'neutral'
    }
  }

  const paymentPercentage = (repayment.amount_paid / repayment.amount_due) * 100

  return (
    <>
      <Helmet>
        <title>{repayment.repayment_number} | Repayments</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/repayments')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{repayment.repayment_number}</h1>
              <p className="text-gray-600 dark:text-gray-400">Loan: {repayment.loan_number}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h2>
                <Badge variant={getStatusColor(repayment.status)}>{repayment.status}</Badge>
              </div>

              {repayment.is_overdue && (
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-danger-700 dark:text-danger-200">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{repayment.days_overdue} days overdue</span>
                  </div>
                </div>
              )}

              {repayment.is_paid && (
                <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <div className="flex items-center gap-2 text-success-700 dark:text-success-200">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Paid in full on {new Date(repayment.payment_date || '').toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Payment Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount Due</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">KES {repayment.amount_due.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                    <p className="text-lg font-semibold text-success-600">KES {repayment.amount_paid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
                    <p className="text-lg font-semibold text-warning-600">KES {repayment.amount_outstanding.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment %</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{paymentPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Principal</span>
                    <span className="font-medium">KES {repayment.principal_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Interest</span>
                    <span className="font-medium">KES {repayment.interest_amount.toLocaleString()}</span>
                  </div>
                  {repayment.penalty_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Penalty</span>
                      <span className="font-medium text-danger-600">KES {repayment.penalty_amount.toLocaleString()}</span>
                    </div>
                  )}
                  {repayment.fee_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Fees</span>
                      <span className="font-medium">KES {repayment.fee_amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{repayment.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer Number</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">{repayment.customer_number}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transaction Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Transaction Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Method</p>
                  <p className="font-medium text-gray-900 dark:text-white">{repayment.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Reference</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{repayment.payment_reference}</p>
                </div>
                {repayment.transaction_id && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Transaction ID</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{repayment.transaction_id}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Dates */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Dates</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Due Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(repayment.due_date).toLocaleDateString()}</p>
                </div>
                {repayment.payment_date && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Payment Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(repayment.payment_date).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Recorded</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(repayment.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>

            {/* Collected By */}
            {repayment.collected_by_name && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Collected By</h3>
                <p className="font-medium text-gray-900 dark:text-white">{repayment.collected_by_name}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}