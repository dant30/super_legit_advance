import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Filter, TrendingUp, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import Pagination from '@/components/shared/Pagination'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Badge from '@/components/ui/Badge'

interface LoanStats {
  active_loans: number
  total_amount: number
  overdue_loans: number
  approval_rate: number
}

export default function LoanList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ status: 'ACTIVE' })
  const [currentPage, setCurrentPage] = useState(1)

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['loans', filters, currentPage],
    queryFn: () => loansAPI.getLoans({ ...filters, page: currentPage }),
  })

  const { data: statsData } = useQuery({
    queryKey: ['loanStats'],
    queryFn: () => loansAPI.getLoanStats(),
  })

  const loans = loansData?.results || []
  const stats: LoanStats = statsData?.summary || {
    active_loans: 0,
    total_amount: 0,
    overdue_loans: 0,
    approval_rate: 0,
  }
  const totalItems = loansData?.count || 0

  const columns = [
    { 
      accessorKey: 'loan_number', 
      header: 'Loan #' 
    },
    { 
      accessorKey: 'customer_name', 
      header: 'Customer' 
    },
    { 
      accessorKey: 'amount_approved', 
      header: 'Amount',
      cell: (info: any) => `KES ${(info.getValue() || 0).toLocaleString()}`
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue()
        const variant = status === 'ACTIVE' ? 'success' : status === 'OVERDUE' ? 'danger' : 'warning'
        return <Badge variant={variant}>{status}</Badge>
      }
    },
    { 
      accessorKey: 'outstanding_balance', 
      header: 'Outstanding',
      cell: (info: any) => `KES ${(info.getValue() || 0).toLocaleString()}`
    },
    { 
      accessorKey: 'repayment_frequency', 
      header: 'Frequency' 
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/loans/${info.row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ]

  if (isLoading) return <Loading />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.active_loans}
              </p>
              <TrendingUp className="h-5 w-5 text-success-600 mt-2" />
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                KES {((stats.total_amount || 0) / 1000000).toFixed(1)}M
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Loans</p>
              <p className="text-2xl font-bold text-danger-600 mt-2">
                {stats.overdue_loans}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {(stats.approval_rate || 0).toFixed(1)}%
              </p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search loans..."
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1"
            />
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Table */}
        {loans.length > 0 ? (
          <>
            <Card className="p-6">
              <Table columns={columns} data={loans} />
            </Card>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={20}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <EmptyState title="No loans found" description="Create a new loan to get started" />
        )}
      </div>
    </>
  )
}