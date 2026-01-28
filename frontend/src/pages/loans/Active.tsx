import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Filter, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Badge from '@/components/ui/Badge'

export default function ActiveLoans() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({})

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['activeLoans', filters],
    queryFn: () => loansAPI.getLoans({ ...filters, status: 'ACTIVE' }),
  })

  const columns = [
    { accessor: 'loan_number', header: 'Loan #' },
    { accessor: 'customer_name', header: 'Customer' },
    { accessor: 'amount_approved', header: 'Amount' },
    { accessor: 'interest_rate', header: 'Interest Rate' },
    { accessor: 'repayment_frequency', header: 'Frequency' },
    { accessor: 'next_payment_date', header: 'Next Payment' },
    { accessor: 'repayment_progress', header: 'Progress' },
  ]

  if (isLoading) return <Loading />

  const loans = loansData?.results || []
  const totalActive = loans.length
  const totalAmount = loans.reduce((sum, l) => sum + (l.amount_approved || 0), 0)
  const avgInterest = (loans.reduce((sum, l) => sum + (l.interest_rate || 0), 0) / (loans.length || 1)).toFixed(1)

  return (
    <>
      <Helmet>
        <title>Active Loans | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Active Loans
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage active loan portfolio
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Active</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {totalActive}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-2xl font-bold text-success-600 mt-2">
              KES {((totalAmount) / 1000000).toFixed(1)}M
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Interest</p>
            <p className="text-2xl font-bold text-primary-600 mt-2">
              {avgInterest}%
            </p>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search loans..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Loans Table */}
        {loans.length > 0 ? (
          <Card className="p-6">
            <Table
              columns={columns}
              data={loans}
              onRowClick={(row) => navigate(`/loans/${row.id}`)}
            />
          </Card>
        ) : (
          <EmptyState
            title="No active loans"
            description="There are currently no active loans"
          />
        )}
      </div>
    </>
  )
}