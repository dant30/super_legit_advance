// frontend/src/pages/customers/List.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { CustomerTable } from '@/components/customers/CustomerTable'
import { CustomerFilters } from '@/components/customers/CustomerFilters'
import { CustomerStats } from '@/components/customers/CustomerStats'
import { CustomerSearch } from '@/components/customers/CustomerSearch'
import { ExportDialog } from '@/components/customers/ExportDialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/shared/Loading'
import { Error } from '@/components/shared/Error'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Pagination } from '@/components/shared/Pagination'
import { useToast } from '@/components/ui/Toast/useToast'
import toast from 'react-hot-toast'
import type { Customer, CustomerListParams } from '@/types/customers'

const CustomerList: React.FC = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { 
    customers, 
    customersLoading, 
    customersError, 
    customersPagination,
    fetchCustomers, 
    searchCustomers,
    getCustomerStats,
    exportCustomers,
    clearError
  } = useCustomers()

  const [filters, setFilters] = useState<CustomerListParams>({
    page: 1,
    page_size: 20,
    ordering: '-created_at'
  })
  const [stats, setStats] = useState<any>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [filters])

  const loadCustomers = async () => {
    try {
      console.log('Loading customers with filters:', filters)
      const result = await fetchCustomers(filters)
      console.log('Customers loaded:', result)
    } catch (error: any) {
      console.error('Failed to load customers:', error)
      toast.error(error.message || 'Failed to load customers')
    }
  }

  const loadStats = async () => {
    try {
      const result = await getCustomerStats()
      console.log('Stats loaded:', result)
      if (result?.payload) {
        setStats(result.payload)
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = async (query: string, type?: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setSearchLoading(true)
      try {
        await searchCustomers(query, type)
        toast.success(`Found customers matching "${query}"`)
      } catch (error: any) {
        toast.error(error.message || 'Failed to search customers')
      } finally {
        setSearchLoading(false)
      }
    } else {
      loadCustomers()
    }
  }

  const handleFilterChange = (newFilters: Partial<CustomerListParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ 
      ...prev, 
      page_size: size, 
      page: 1
    }))
  }

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      toast.loading('Exporting customers...')
      const blob = await exportCustomers(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.dismiss()
      toast.success(`Customers exported successfully as ${format.toUpperCase()}`)
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to export customers')
    }
  }

  const handleCreateCustomer = () => {
    navigate('/customers/create')
  }

  const handleViewDetail = (customer: Customer) => {
    navigate(`/customers/${customer.id}`)
  }

  const handleEditCustomer = (customer: Customer) => {
    navigate(`/customers/${customer.id}/edit`)
  }

  const handleBlacklist = async (customer: Customer) => {
    const reason = prompt('Enter reason for blacklisting:')
    if (reason) {
      toast.success(`Customer ${customer.full_name} has been blacklisted`)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' }
  ]

  // ✅ FIXED: Ensure customers is an array
  const customersList = Array.isArray(customers) ? customers : []
  
  const totalItems = customersPagination?.total || 0
  const totalPages = customersPagination?.total_pages || 1
  const currentPage = customersPagination?.page || 1
  const pageSize = filters.page_size || 20

  if (customersLoading && customersList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading message="Loading customers..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-2">Manage your customer database</p>
          </div>
          <div className="flex space-x-3">
            {isAdmin() && (
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
              >
                Export
              </Button>
            )}
            <Button onClick={handleCreateCustomer}>
              <span>+ Add Customer</span>
            </Button>
          </div>
        </div>
      </div>

      {stats && <CustomerStats stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CustomerFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="mb-4 p-4">
              <CustomerSearch 
                onSearch={handleSearch} 
                loading={searchLoading}
              />
            </div>
            
            {customersError && (
              <div className="px-4">
                <Error 
                  message={customersError} 
                  onRetry={loadCustomers}
                  onDismiss={clearError}
                />
              </div>
            )}

            <div className="px-4">
              {/* ✅ FIXED: Explicitly pass customers array */}
              <CustomerTable
                customers={customersList}
                loading={customersLoading || searchLoading}
                onViewDetail={handleViewDetail}
                onEdit={handleEditCustomer}
                onBlacklist={handleBlacklist}
              />
            </div>

            {totalItems > 0 && (
              <div className="mt-6 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  className="border-none"
                  showPageSize={true}
                  showInfo={true}
                  showFirstLast={true}
                />
              </div>
            )}

            {totalItems === 0 && !customersLoading && !searchLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">No customers found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateCustomer}
                >
                  + Add Your First Customer
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {showExportDialog && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          onExport={handleExport}
        />
      )}
    </div>
  )
}

export default CustomerList