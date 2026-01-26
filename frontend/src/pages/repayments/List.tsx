import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { repaymentsAPI } from '@/lib/api/repayments'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface RepaymentFilter {
  status?: string
  payment_method?: string
  start_date?: string
  end_date?: string
  search?: string
}

export default function RepaymentList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<RepaymentFilter>({})
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: repayments, isLoading, refetch } = useQuery({
    queryKey: ['repayments', filters, page],
    queryFn: () => repaymentsAPI.getRepayments({ ...filters, page }),
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters({ ...filters, search: value })
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await repaymentsAPI.deleteRepayment(deleteId)
      toast.success('Repayment deleted successfully')
      setDeleteId(null)
      refetch()
    } catch (error) {
      toast.error('Failed to delete repayment')
    }
  }

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const blob = await repaymentsAPI.exportRepayments({ format, ...filters })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `repayments_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Exported to ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'OVERDUE':
        return 'danger'
      case 'PARTIAL':
        return 'info'
      default:
        return 'neutral'
    }
  }

  if (isLoading) return <Loading />

  const repaymentList = repayments?.results || []
  const stats = {
    pending: repaymentList.filter(r => r.status === 'PENDING').length,
    completed: repaymentList.filter(r => r.status === 'COMPLETED').length,
    overdue: repaymentList.filter(r => r.status === 'OVERDUE').length,
    totalAmount: repaymentList.reduce((sum, r) => sum + r.amount_paid, 0),
  }

  return (
    <>
      <Helmet>
        <title>Repayments | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Repayments</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Track and manage loan repayments</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleExport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button size="sm" onClick={() => navigate('/repayments/collect')}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Repayments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-success-500 mt-1">{stats.completed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
            <p className="text-2xl font-bold text-danger-500 mt-1">{stats.overdue}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount Paid</p>
            <p className="text-2xl font-bold text-primary-500 mt-1">KES {(stats.totalAmount / 1000).toFixed(0)}K</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <Filter className="h-4 w-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search repayments..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PARTIAL">Partial</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                value={filters.payment_method || ''}
                onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
              >
                <option value="">All Methods</option>
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Table */}
        {repaymentList.length > 0 ? (
          <Card>
            <Table>
              <thead>
                <tr>
                  <th>Repayment #</th>
                  <th>Loan #</th>
                  <th>Customer</th>
                  <th>Amount Due</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {repaymentList.map((repayment) => (
                  <tr key={repayment.id}>
                    <td className="font-mono text-sm">{repayment.repayment_number}</td>
                    <td className="font-mono text-sm">{repayment.loan_number}</td>
                    <td>{repayment.customer_name}</td>
                    <td>KES {repayment.amount_due.toLocaleString()}</td>
                    <td className="font-semibold text-success-600">KES {repayment.amount_paid.toLocaleString()}</td>
                    <td>
                      <Badge variant={getStatusColor(repayment.status)}>{repayment.status}</Badge>
                    </td>
                    <td>{new Date(repayment.due_date).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/repayments/${repayment.id}`)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/repayments/${repayment.id}/edit`)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(repayment.id)}
                          className="p-1 hover:bg-danger-100 dark:hover:bg-danger-900/20 rounded text-danger-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                current={page}
                total={Math.ceil((repayments?.count || 0) / 20)}
                onPageChange={setPage}
              />
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No repayments found"
            description="Start by recording a payment for a loan"
            action={{
              label: 'Record Payment',
              onClick: () => navigate('/repayments/collect'),
            }}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Repayment"
        message="Are you sure you want to delete this repayment record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDangerous
      />
    </>
  )
}