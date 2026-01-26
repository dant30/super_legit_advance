import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Download, Share2, MoreVertical } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { loansAPI } from '@/lib/api/loans'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: application, isLoading } = useQuery({
    queryKey: ['loanApplication', id],
    queryFn: () => loansAPI.getLoanApplication(parseInt(id!)),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: (data: any) => loansAPI.approveLoanApplication(parseInt(id!), data),
    onSuccess: () => {
      toast.success('Application approved')
      navigate('/loans/approvals')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => loansAPI.rejectLoanApplication(parseInt(id!), { rejection_reason: reason }),
    onSuccess: () => {
      toast.success('Application rejected')
      navigate('/loans/applications')
    },
  })

  if (isLoading) return <Loading />
  if (!application) return <EmptyState title="Application not found" />

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'affordability', label: 'Affordability' },
    { id: 'history', label: 'History' },
  ]

  return (
    <>
      <Helmet>
        <title>Application {id} | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/loans/applications')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Application #{application.id}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {application.customer_name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <Card className={`p-4 border-l-4 ${
          application.status === 'APPROVED' ? 'bg-success-50 border-success-500 dark:bg-success-900/20' :
          application.status === 'REJECTED' ? 'bg-danger-50 border-danger-500 dark:bg-danger-900/20' :
          'bg-warning-50 border-warning-500 dark:bg-warning-900/20'
        }`}>
          <h3 className="font-semibold">Status: {application.status}</h3>
          <p className="text-sm mt-2">
            Application date: {new Date(application.application_date).toLocaleDateString()}
          </p>
        </Card>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
          {activeTab === 'overview' && (
            <Card className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Application Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Loan Type</p>
                      <p className="text-sm font-medium">{application.loan_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Amount Requested</p>
                      <p className="text-sm font-medium">
                        KES {(application.amount_requested / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Term</p>
                      <p className="text-sm font-medium">{application.term_months} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Purpose</p>
                      <p className="text-sm font-medium">{application.purpose}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Risk Assessment
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                      <p className={`text-sm font-medium ${
                        application.risk_level === 'HIGH' ? 'text-danger-600' :
                        application.risk_level === 'MEDIUM' ? 'text-warning-600' :
                        'text-success-600'
                      }`}>
                        {application.risk_level}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Risk Score</p>
                      <p className="text-sm font-medium">{application.risk_score}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Credit Score</p>
                      <p className="text-sm font-medium">{application.credit_score || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {application.status === 'UNDER_REVIEW' && (
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    variant="success"
                    onClick={() => approveMutation.mutate({ approved_amount: application.amount_requested })}
                    loading={approveMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => rejectMutation.mutate('Risk assessment failed')}
                    loading={rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'affordability' && (
            <Card className="p-6">
              {application.affordability_analysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        KES {(application.total_monthly_income / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Disposable Income</p>
                      <p className="text-2xl font-bold text-success-600">
                        KES {(application.disposable_income / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Debt to Income Ratio</p>
                      <p className="text-2xl font-bold">{(application.debt_to_income_ratio * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Proposed Installment</p>
                      <p className="text-2xl font-bold">
                        KES {(application.affordability_analysis.proposed_installment / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-info-50 dark:bg-info-900/20 rounded-lg">
                    <p className="text-sm font-medium">Recommendation</p>
                    <p className="text-sm mt-2">{application.affordability_analysis.recommendation}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No affordability analysis available</p>
              )}
            </Card>
          )}
        </Tabs>
      </div>
    </>
  )
}