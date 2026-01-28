import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AlertCircle, TrendingDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function OverdueLoans() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<{ status: string }>({ status: 'OVERDUE' })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['overdueLoans', filters],
    queryFn: () => loansAPI.getLoans({ ...filters, search: searchTerm }),
  })

  const columns = [
    { accessor: 'loan_number', header: 'Loan #' },
    { accessor: 'customer_name', header: 'Customer' },
    { accessor: 'phone_number', header: 'Phone' },
    { accessor: 'outstanding_balance', header: 'Outstanding' },
    { accessor: 'total_penalties', header: 'Penalties' },
    { accessor: 'days_overdue', header: 'Days Overdue' },
    {
      accessor: 'id',
      header: 'Actions',
      cell: (info: any) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/loans/${info.getValue()}`)}
        >
          View
        </Button>
      ),
    },
  ]

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
              <AlertCircle className="h-6 w-6 text-danger-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger-900 dark:text-danger-100">
                  {totalOverdue} Overdue Loans Detected
                </p>
                <p className="text-sm text-danger-800 dark:text-danger-200 mt-1">
                  Total Outstanding: KES {(totalOutstanding / 1000000).toFixed(1)}M | 
                  Total Penalties: KES {(totalPenalties / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Loans</p>
            <p className="text-2xl font-bold text-danger-600 mt-2">{totalOverdue}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              KES {(totalOutstanding / 1000000).toFixed(1)}M
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Penalties</p>
            <p className="text-2xl font-bold text-warning-600 mt-2">
              KES {(totalPenalties / 1000).toFixed(0)}K
            </p>
          </Card>
        </div>

        {/* Table */}
        {loans.length > 0 ? (
          <Card className="p-6">
            <Table data={loans} columns={columns} />
          </Card>
        ) : (
          <EmptyState title="No overdue loans" icon={<TrendingDown className="h-12 w-12" />} />
        )}
      </div>
    </>
  )
}