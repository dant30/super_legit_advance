import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Input  }from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

interface LoanFilter {
  status?: string
  search?: string
  page?: number
}

export default function LoanList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<LoanFilter>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: loansData, isLoading: loansLoading } = useQuery({
    queryKey: ['loans', filters],
    queryFn: () => loansAPI.getLoans(filters),
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['loanStats'],
    queryFn: () => loansAPI.getLoanStats(),
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ ...filters, search: term, page: 1 })
  }

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status || undefined, page: 1 })
  }

  if (loansLoading || statsLoading) return <Loading />

  const loans = loansData?.results || []
  const stats = statsData || {}

  return (
    <>
      <Helmet>
        <title>Loans | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Loans
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and track all loan applications
            </p>
          </div>
          <Button onClick={() => navigate('/loans/create')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Loan
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.active_loans || 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                KES {((stats.total_amount || 0) / 1000).toFixed(0)}K
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Loans</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-danger-500">
                  {stats.overdue_loans || 0}
                </p>
                <TrendingDown className="h-4 w-4 text-danger-500" />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-success-500">
                  {stats.approval_rate || 0}%
                </p>
                <TrendingUp className="h-4 w-4 text-success-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search loans by number or customer..."
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
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Loans Table */}
        {loans.length > 0 ? (
          <Card>
            <Table
              columns={[
                { key: 'loan_number', label: 'Loan #' },
                { key: 'customer_name', label: 'Customer' },
                { key: 'amount_approved', label: 'Amount' },
                { key: 'status', label: 'Status' },
                { key: 'interest_rate', label: 'Rate' },
                { key: 'disbursement_date', label: 'Disbursed' },
              ]}
              data={loans.map((loan: any) => ({
                ...loan,
                customer_name: loan.customer?.full_name || 'N/A',
                amount_approved: `KES ${(loan.amount_approved / 1000).toFixed(0)}K`,
                interest_rate: `${loan.interest_rate}%`,
              }))}
              onRowClick={(row) => navigate(`/loans/${row.id}`)}
            />
          </Card>
        ) : (
          <EmptyState
            title="No loans found"
            description="Create your first loan to get started"
            action={
              <Button onClick={() => navigate('/loans/create')}>
                <Plus className="h-4 w-4 mr-2" />
                New Loan
              </Button>
            }
          />
        )}
      </div>
    </>
  )
}