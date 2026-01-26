import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { TrendingUp, Filter, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function ActiveLoans() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ status: 'ACTIVE' })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['activeLoans', filters],
    queryFn: () => loansAPI.getLoans({ ...filters, search: searchTerm }),
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ ...filters, search: term, page: 1 })
  }

  if (isLoading) return <Loading />

  const loans = loansData?.results || []
  const totalActive = loans.length
  const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstanding_balance || 0), 0)

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
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {totalActive}
            </p>
            <p className="text-xs text-success-600 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Current portfolio
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              KES {(totalOutstanding / 1000000).toFixed(1)}M
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Outstanding</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              KES {totalActive > 0 ? ((totalOutstanding / totalActive) / 1000).toFixed(0) : 0}K
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by loan number or customer..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="secondary" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
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
                { key: 'amount_disbursed', label: 'Disbursed' },
                { key: 'outstanding_balance', label: 'Outstanding' },
                { key: 'next_payment_date', label: 'Next Payment' },
                { key: 'repayment_progress', label: 'Progress' },
              ]}
              data={loans.map((loan: any) => ({
                ...loan,
                amount_disbursed: `KES ${(loan.amount_disbursed / 1000).toFixed(0)}K`,
                outstanding_balance: `KES ${(loan.outstanding_balance / 1000).toFixed(0)}K`,
                repayment_progress: `${loan.repayment_progress || 0}%`,
              }))}
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