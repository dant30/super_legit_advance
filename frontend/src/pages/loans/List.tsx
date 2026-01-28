import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { loansAPI } from '@/lib/api/loans'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'

export default function LoanList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<{ status?: string }>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['loans', filters, searchTerm],
    queryFn: () => loansAPI.getLoans({ ...filters, search: searchTerm }),
  })

  const columns = [
    { accessor: 'loan_number', header: 'Loan #' },
    { accessor: 'customer_name', header: 'Customer' },
    { accessor: 'loan_type', header: 'Type' },
    { accessor: 'amount_disbursed', header: 'Disbursed' },
    { accessor: 'outstanding_balance', header: 'Outstanding' },
    { accessor: 'status', header: 'Status' },
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
  const stats = loansData?.summary || {}

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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.total_loans || 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-success-600 mt-2">
                KES {((stats.total_amount || 0) / 1000000).toFixed(1)}M
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Loans</p>
              <p className="text-2xl font-bold text-danger-600 mt-2">
                {stats.overdue_loans || 0}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Table */}
        {loans.length > 0 ? (
          <Card className="p-6">
            <Table data={loans} columns={columns} />
          </Card>
        ) : (
          <EmptyState title="No loans found" />
        )}
      </div>
    </>
  )
}