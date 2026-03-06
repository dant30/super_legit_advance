import React, { useState } from 'react'
import PageHeader from '@components/ui/PageHeader'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { LoanApproval } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'
import { formatCurrency } from '../services/loans'

const LoanApprovals = () => {
  const { useLoanApplicationsQuery, useApproveLoanApplication, useRejectLoanApplication } = useLoanContext()
  const { data, isLoading } = useLoanApplicationsQuery({ pending: true })
  const approveMutation = useApproveLoanApplication()
  const rejectMutation = useRejectLoanApplication()
  const [selected, setSelected] = useState(null)

  const applications = Array.isArray(data)
    ? data
    : data?.results || data?.data?.results || data?.data || []

  const handleApprove = async (payload) => {
    if (!selected) return
    await approveMutation.mutateAsync({ id: selected.id, data: payload })
    setSelected(null)
  }

  const handleReject = async (reason) => {
    if (!selected) return
    await rejectMutation.mutateAsync({ id: selected.id, reason })
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Loan Approvals" subTitle="Review and approve pending applications" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900">Pending Applications</h3>
          {isLoading ? (
            <div className="py-8 text-sm text-gray-500">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="py-8 text-sm text-gray-500">No pending applications.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {app.customer_name || app.customer_details?.full_name || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(app.amount_requested)} - {app.loan_type}
                    </p>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto" onClick={() => setSelected(app)}>Review</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div>
          <LoanApproval
            item={selected}
            onApprove={handleApprove}
            onReject={handleReject}
            submitting={approveMutation.isPending || rejectMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}

export default LoanApprovals
