import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function LoanApprovals() {
  const navigate = useNavigate()
  const [selectedApp, setSelectedApp] = useState<number | null>(null)

  const { data: applicationsData, isLoading, refetch } = useQuery({
    queryKey: ['pendingApplications'],
    queryFn: () => loansAPI.getLoanApplications({ status: 'UNDER_REVIEW', page_size: 50 }),
  })

  const handleApprove = async (id: number, amount: number) => {
    try {
      await loansAPI.approveLoanApplication(id, {
        approved_amount: amount,
        notes: 'Approved by system',
      })
      toast.success('Application approved')
      refetch()
    } catch (error) {
      toast.error('Failed to approve application')
    }
  }

  const handleReject = async (id: number, reason: string) => {
    try {
      await loansAPI.rejectLoanApplication(id, { rejection_reason: reason })
      toast.success('Application rejected')
      refetch()
    } catch (error) {
      toast.error('Failed to reject application')
    }
  }

  if (isLoading) return <Loading />

  const applications = applicationsData?.results || []

  return (
    <>
      <Helmet>
        <title>Loan Approvals | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Loan Approvals
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Review pending loan applications
          </p>
        </div>

        {applications.length > 0 ? (
          <div className="grid gap-4">
            {applications.map((app: any) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {app.customer_name}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Loan Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {app.loan_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          KES {(app.amount_requested / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                        <p className={`text-sm font-medium ${
                          app.risk_level === 'HIGH' ? 'text-danger-600' :
                          app.risk_level === 'MEDIUM' ? 'text-warning-600' :
                          'text-success-600'
                        }`}>
                          {app.risk_level}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Term</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {app.term_months} months
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(app.id, app.amount_requested)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(app.id, 'Failed risk assessment')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/loans/applications/${app.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No pending approvals"
            description="All loan applications have been reviewed"
            icon={<CheckCircle className="h-12 w-12 text-success-500" />}
          />
        )}
      </div>
    </>
  )
}