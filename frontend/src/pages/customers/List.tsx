// frontend/src/pages/customers/List.tsx
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
import type { Customer, CustomerListParams } from '@/types/customers'

const CustomerList: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
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

  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [filters])

  const loadCustomers = async () => {
    try {
      await fetchCustomers(filters)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive'
      })
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getCustomerStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = async (query: string, type?: string) => {
    setSearchQuery(query)
    if (query) {
      try {
        await searchCustomers(query, type)
      } catch (error) {
        toast({
          title: 'Search Error',
          description: 'Failed to search customers',
          variant: 'destructive'
        })
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

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const blob = await exportCustomers(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers_export.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: 'Export Successful',
        description: `Customers exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export customers',
        variant: 'destructive'
      })
    }
  }

  const handleCreateCustomer = () => {
    navigate('/customers/create')
  }

  const handleViewDetail = (customer: Customer) => {
    navigate(`/customers/${customer.id}`)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' }
  ]

  if (customersLoading && (!customers || customers.length === 0)) {
    return <Loading message="Loading customers..." />
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
          <Card>
            <div className="mb-4">
              <CustomerSearch onSearch={handleSearch} />
            </div>
            
            {customersError && (
              <Error 
                message={customersError} 
                onRetry={loadCustomers}
                onDismiss={clearError}
              />
            )}

            {Array.isArray(customers) && customers.length > 0 ? (
              <CustomerTable
                customers={customers}
                loading={customersLoading}
                onViewDetail={handleViewDetail}
                onEdit={(customer) => navigate(`/customers/${customer.id}/edit`)}
                onBlacklist={(customer) => {
                  // Implement blacklist logic
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No customers found</p>
              </div>
            )}

            <div className="mt-4">
              <Pagination
                currentPage={customersPagination?.page || 1}
                totalPages={customersPagination?.total_pages || 1}
                totalItems={customersPagination?.total || 0}
                pageSize={customersPagination?.page_size || 20}
                onPageChange={handlePageChange}
                onPageSizeChange={(size) => 
                  setFilters(prev => ({ ...prev, page_size: size, page: 1 }))
                }
              />
            </div>
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
