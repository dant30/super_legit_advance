import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Download, Edit2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Badge from '@/components/ui/Badge'
import { Loan } from '@/lib/api/loans'

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: loan, isLoading, error } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => loansAPI.getLoan(parseInt(id || '0')),
    enabled: !!id,
  })

  if (isLoading) return <Loading />
  if (error || !loan) return <EmptyState title="Loan not found" />

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'COMPLETED':
        return 'success'
      case 'OVERDUE':
        return 'danger'
      case 'DEFAULTED':
        return 'danger'
      case 'APPROVED':
        return 'info'
      case 'PENDING':
        return 'warning'
      default:
        return 'neutral'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-5 w-5 text-success-600" />
      case 'OVERDUE':
        return <AlertCircle className="h-5 w-5 text-danger-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-warning-600" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-danger-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <>
      <Helmet>
        <title>Loan {loan.loan_number} | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/loans')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Loan {loan.loan_number}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {loan.customer_name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(loan.status)}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {loan.status}
              </p>
            </div>
          </div>
          <Badge variant={getStatusColor(loan.status) as any}>{loan.status}</Badge>
        </Card>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Key Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Loan Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loan Type</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {loan.loan_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Purpose</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {loan.purpose}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Requested</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    KES {(loan.amount_requested || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Approved</p>
                  <p className="text-lg font-medium text-success-600 mt-1">
                    KES {(loan.amount_approved || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Term</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {loan.term_months} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {loan.interest_rate}%
                  </p>
                </div>
              </div>
            </Card>

            {/* Repayment Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Repayment Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Repayment Frequency</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {loan.repayment_frequency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Installment Amount</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    KES {(loan.installment_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    KES {(loan.total_interest || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount Due</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    KES {(loan.total_amount_due || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                  <p className="text-lg font-medium text-success-600 mt-1">
                    KES {(loan.amount_paid || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Balance</p>
                  <p className="text-lg font-medium text-danger-600 mt-1">
                    KES {(loan.outstanding_balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Timeline */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Timeline
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Applied
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {formatDate(loan.application_date)}
                  </p>
                </div>
                {loan.approval_date && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Approved
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(loan.approval_date)}
                    </p>
                  </div>
                )}
                {loan.disbursement_date && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Disbursed
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(loan.disbursement_date)}
                    </p>
                  </div>
                )}
                {loan.start_date && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Start Date
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(loan.start_date)}
                    </p>
                  </div>
                )}
                {loan.maturity_date && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Maturity Date
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(loan.maturity_date)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}