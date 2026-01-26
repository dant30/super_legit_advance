import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => loansAPI.getLoan(id!),
    enabled: !!id,
  })

  if (isLoading) return <Loading />
  if (!loan) return <EmptyState title="Loan not found" />

  const statusColors = {
    ACTIVE: 'bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300',
    PENDING: 'bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-300',
    APPROVED: 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300',
    COMPLETED: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300',
    REJECTED: 'bg-danger-100 dark:bg-danger-900/20 text-danger-800 dark:text-danger-300',
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5" />
      case 'PENDING':
        return <Clock className="h-5 w-5" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <>
      <Helmet>
        <title>{loan.loan_number} | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/loans')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {loan.loan_number}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loan.customer?.full_name}
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${statusColors[loan.status as keyof typeof statusColors]}`}>
            {getStatusIcon(loan.status)}
            <span className="font-medium">{loan.status}</span>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Loan Amount</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              KES {(loan.amount_approved / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Requested: KES {(loan.amount_requested / 1000).toFixed(0)}K
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Balance</p>
            <p className="text-3xl font-bold text-warning-500 mt-2">
              KES {(loan.outstanding_balance / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Interest Rate: {loan.interest_rate}%
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Repayment Progress</p>
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-success-500 h-2 rounded-full"
                  style={{
                    width: `${((loan.amount_paid || 0) / loan.total_amount_due) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {((loan.amount_paid || 0) / loan.total_amount_due * 100).toFixed(0)}% Paid
              </p>
            </div>
          </Card>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Loan Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loan Type</p>
                <p className="text-gray-900 dark:text-white">{loan.loan_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Term</p>
                <p className="text-gray-900 dark:text-white">{loan.term_months} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Purpose</p>
                <p className="text-gray-900 dark:text-white">{loan.purpose}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Key Dates
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disbursement</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(loan.disbursement_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maturity</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(loan.maturity_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {loan.status === 'PENDING' && (
            <>
              <Button variant="success">Approve</Button>
              <Button variant="danger">Reject</Button>
            </>
          )}
          {loan.status === 'APPROVED' && (
            <Button>Disburse</Button>
          )}
        </div>
      </div>
    </>
  )
}