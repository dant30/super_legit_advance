import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Badge from '@/components/ui/Badge'

export default function LoanApplications() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['loanApplications', filters],
    queryFn: () => loansAPI.getLoanApplications({ ...filters, search: searchTerm }),
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ ...filters, search: term, page: 1 })
  }

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status || undefined, page: 1 })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-5 w-5 text-success-600" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-danger-600" />
      case 'UNDER_REVIEW':
        return <Clock className="h-5 w-5 text-warning-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-warning-100 text-warning-800',
      DOCUMENTS_REQUESTED: 'bg-info-100 text-info-800',
      DOCUMENTS_RECEIVED: 'bg-info-100 text-info-800',
      CREDIT_CHECK: 'bg-info-100 text-info-800',
      APPROVED: 'bg-success-100 text-success-800',
      REJECTED: 'bg-danger-100 text-danger-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) return <Loading />

  const applications = applicationsData?.results || []

  return (
    <>
      <Helmet>
        <title>Loan Applications | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Loan Applications
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Review and manage all loan applications
            </p>
          </div>
          <Button onClick={() => navigate('/loans')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Button variant="secondary" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Applications Table */}
        {applications.length > 0 ? (
          <Card>
            <Table
              columns={[
                { key: 'id', label: 'App ID' },
                { key: 'customer_name', label: 'Customer' },
                { key: 'loan_type', label: 'Type' },
                { key: 'amount_requested', label: 'Amount' },
                { key: 'status', label: 'Status' },
                { key: 'application_date', label: 'Date' },
              ]}
              data={applications.map((app: any) => ({
                ...app,
                amount_requested: `KES ${(app.amount_requested / 1000).toFixed(0)}K`,
              }))}
              onRowClick={(row) => navigate(`/loans/applications/${row.id}`)}
            />
          </Card>
        ) : (
          <EmptyState
            title="No applications found"
            description="Create your first loan application to get started"
            action={
              <Button onClick={() => navigate('/loans/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Application
              </Button>
            }
          />
        )}
      </div>
    </>
  )
}