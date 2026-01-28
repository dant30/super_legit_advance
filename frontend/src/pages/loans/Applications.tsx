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

export default function LoanApplications() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<{ status?: string; search?: string }>({
    status: undefined,
    search: '',
  })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['loanApplications', filters],
    queryFn: () => loansAPI.getLoanApplications(filters),
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ ...filters, search: term })
  }

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status || undefined })
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

  const columns = [
    { accessor: 'customer_name', header: 'Customer' },
    { accessor: 'loan_type', header: 'Loan Type' },
    { accessor: 'amount_requested', header: 'Amount' },
    { accessor: 'term_months', header: 'Term' },
    { accessor: 'status', header: 'Status' },
    { accessor: 'application_date', header: 'Date' },
  ]

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
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Table */}
        {applications.length > 0 ? (
          <Card className="p-6">
            <Table data={applications} columns={columns} />
          </Card>
        ) : (
          <EmptyState title="No applications found" />
        )}
      </div>
    </>
  )
}