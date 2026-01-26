import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AlertCircle, Filter, Phone, MessageSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function OverdueLoans() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ status: 'OVERDUE' })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['overdueLoans', filters],
    queryFn: () => loansAPI.getLoans({ ...filters, search: searchTerm }),
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ ...filters, search: term, page: 1 })
  }

  if (isLoading) return <Loading />

  const loans = loansData?.results || []
  const totalOverdue = loans.length
  const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstanding_balance || 0), 0)
  const totalPenalties = loans.reduce((sum, l) => sum + (l.total_penalties || 0), 0)

  return (
    <>
      <Helmet>
        <title>Overdue Loans | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Overdue Loans
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Track and manage overdue accounts
            </p>
          </div>
        </div>

        {/* Risk Alert */}
        {totalOverdue > 0 && (
          <Card className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-danger-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-danger-900 dark:text-danger-100">
                  {totalOverdue} Overdue Accounts
                </h3>
                <p className="text-sm text-danger-800 dark:text-danger-200 mt-1">
                  Total outstanding: KES {(totalOutstanding / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Overdue</p>
            <p className="text-3xl font-bold text-danger-600 mt-2">{totalOverdue}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              KES {(totalOutstanding / 1000000).toFixed(1)}M
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Penalties</p>
            <p className="text-3xl font-bold text-warning-600 mt-2">
              KES {(totalPenalties / 1000).toFixed(0)}K
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {totalOverdue > 0 ? Math.round((loans.filter((l: any) => l.amount_paid > 0).length / totalOverdue) * 100) : 0}%
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
                { key: 'days_overdue', label: 'Days Overdue' },
                { key: 'outstanding_balance', label: 'Outstanding' },
                { key: 'total_penalties', label: 'Penalties' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={loans.map((loan: any) => ({
                ...loan,
                outstanding_balance: `KES ${(loan.outstanding_balance / 1000).toFixed(0)}K`,
                total_penalties: `KES ${(loan.total_penalties / 1000).toFixed(0)}K`,
                actions: 'Call',
              }))}
              onRowClick={(row) => navigate(`/loans/${row.id}`)}
            />
          </Card>
        ) : (
          <EmptyState
            title="No overdue loans"
            description="Great news! All loans are current"
            icon={<AlertCircle className="h-12 w-12 text-success-500" />}
          />
        )}
      </div>
    </>
  )
}