import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Plus, Search, Filter, Download, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import  Pagination from '@/components/shared/Pagination'
import Badge  from '@/components/ui/Badge'

interface Filter {
  page?: number
  page_size?: number
  search?: string
  status?: string
}

export default function CustomerList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filter>({ page: 1, page_size: 20 })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerAPI.getCustomers(filters),
    staleTime: 1000 * 60 * 5,
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ ...filters, search: term, page: 1 })
  }

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status || undefined, page: 1 })
  }

  const handleExport = async () => {
    try {
      const blob = await customerAPI.exportCustomers('excel', filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Customers exported successfully')
    } catch (err) {
      toast.error('Export failed')
      console.error('Export failed:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await customerAPI.deleteCustomer(deleteId)
      toast.success('Customer deleted successfully')
      refetch()
      setDeleteId(null)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete customer')
    }
  }

  if (isLoading) return <Loading />
  if (error) return <EmptyState title="Error loading customers" />

  const customers = data?.results || []
  const hasCustomers = customers.length > 0

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return 'default'
    
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      BLACKLISTED: 'error',
      DECEASED: 'default',
    }
    return statusMap[status] || 'default'
  }

  return (
    <>
      <Helmet>
        <title>Customers | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and view all customer profiles
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/customers/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
            <Button variant="secondary" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Search
              </label>
              <Input
                placeholder="Name, phone, ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Page Size
              </label>
              <select
                value={filters.page_size || 20}
                onChange={(e) =>
                  setFilters({ ...filters, page_size: Number(e.target.value), page: 1 })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Customers Table */}
        {hasCustomers ? (
          <>
            <Card>
              <Table
                columns={[
                  { key: 'customer_number', label: 'ID' },
                  { key: 'full_name', label: 'Name' },
                  { key: 'phone_number', label: 'Phone' },
                  { key: 'email', label: 'Email' },
                  { key: 'status', label: 'Status' },
                  { key: 'credit_score', label: 'Credit Score' },
                  { key: 'actions', label: '' },
                ]}
                data={customers.map((customer: any) => ({
                  customer_number: customer.customer_number,
                  full_name: customer.full_name,
                  phone_number: customer.phone_number,
                  email: customer.email || '-',
                  status: (
                    <Badge variant={getStatusBadge(customer.status)}>
                      {customer.status}
                    </Badge>
                  ),
                  credit_score: customer.credit_score,
                  actions: (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="More actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  ),
                }))}
              />
            </Card>

            {/* Pagination */}
            {data && data.count > 0 && (
              <Pagination
                currentPage={filters.page || 1}
                pageSize={filters.page_size || 20}
                totalItems={data.count}
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            )}
          </>
        ) : (
          <EmptyState title="No customers found" description="Start by adding a new customer" />
        )}

        {/* Actions Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedCustomer(null)
          }}
          title="Customer Actions"
        >
          <div className="space-y-3">
            {selectedCustomer && (
              <>
                <button
                  onClick={() => {
                    navigate(`/customers/${selectedCustomer.id}`)
                    setShowModal(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    navigate(`/customers/${selectedCustomer.id}`)
                    setShowModal(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    navigate(`/customers/${selectedCustomer.id}/guarantors`)
                    setShowModal(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Manage Guarantors
                </button>
                <button
                  onClick={() => {
                    navigate(`/customers/${selectedCustomer.id}/employment`)
                    setShowModal(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Employment Info
                </button>
                {selectedCustomer.status !== 'BLACKLISTED' && (
                  <button
                    onClick={() => {
                      navigate(`/customers/blacklist?id=${selectedCustomer.id}`)
                      setShowModal(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 mr-2 inline" />
                    Blacklist
                  </button>
                )}
                <button
                  onClick={() => {
                    setDeleteId(selectedCustomer.id)
                    setShowModal(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2 inline" />
                  Delete
                </button>
              </>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Confirm Delete"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete this customer? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    </>
  )
}