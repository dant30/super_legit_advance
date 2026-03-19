// frontend/src/pages/customers/CustomerList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Tabs from '@components/ui/Tabs'
import Badge from '@components/ui/Badge'
import PageHeader from '@components/ui/PageHeader'
import { Plus, Download, Upload, Filter, RefreshCw, Users, UserCheck, UserX, Activity } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerContext } from '@contexts/CustomerContext'
import { CustomerTable, CustomerFilters, CustomerSearch } from '@components/customers'
import { ImportDialog, ExportDialog } from '@components/customers'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useToast } from '@contexts/ToastContext'

const CustomerList = () => {
  const navigate = useNavigate()
  const { 
    customers = [],
    customersLoading, 
    customersPagination = { page: 1, page_size: 20, total: 0, total_pages: 0 },
    fetchCustomers, 
    deleteCustomer,
    blacklistCustomer,
    activateCustomer,
    exportCustomers,
    getCustomerStats,
    stats,
    setStatePartial
  } = useCustomerContext()
  
  const { hasPermission } = useAuth()
  const { addToast } = useToast()
  
  const [filters, setFilters] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const page = customersPagination?.page ?? 1
  const pageSize = customersPagination?.page_size ?? 20

  const buildQueryParams = useCallback((nextPage = page, nextPageSize = pageSize) => {
    const base = {
      ...filters,
      page: nextPage,
      page_size: nextPageSize,
    }

    if (activeTab === 'all') return base
    if (activeTab === 'high_risk') {
      return { ...base, risk_level: 'HIGH' }
    }

    return { ...base, status: activeTab.toUpperCase() }
  }, [activeTab, filters, page, pageSize])

  const loadCustomers = useCallback(async () => {
    if (typeof fetchCustomers !== 'function') return
    const params = buildQueryParams(page, pageSize)
    await fetchCustomers(params)
  }, [fetchCustomers, buildQueryParams, page, pageSize])

  const loadStats = useCallback(async () => {
    if (typeof getCustomerStats !== 'function') return
    await getCustomerStats()
  }, [getCustomerStats])

  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [filters, activeTab, loadCustomers, loadStats])

  const handlePageChange = (page, pageSize) => {
    setStatePartial({
      customersPagination: {
        ...customersPagination,
        page,
        page_size: pageSize,
      },
    })
    if (typeof fetchCustomers === 'function') {
      fetchCustomers(buildQueryParams(page, pageSize))
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleResetFilters = () => {
    setFilters({})
    setActiveTab('all')
  }

  const handleDelete = async (id) => {
    try {
      const response = await deleteCustomer(id)
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to delete customer')
      }
      addToast('Customer deleted successfully', 'success')
    } catch (error) {
      addToast(error?.message || 'Failed to delete customer', 'error')
    }
  }

  const handleBlacklist = async (id) => {
    try {
      const response = await blacklistCustomer(id, 'Manual blacklisting by admin')
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to blacklist customer')
      }
      addToast('Customer blacklisted successfully', 'success')
    } catch (error) {
      addToast(error?.message || 'Failed to blacklist customer', 'error')
    }
  }

  const handleActivate = async (id) => {
    try {
      const response = await activateCustomer(id)
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to activate customer')
      }
      addToast('Customer activated successfully', 'success')
    } catch (error) {
      addToast(error?.message || 'Failed to activate customer', 'error')
    }
  }

  const handleExport = async (customerIds = null) => {
    try {
      const exportFilters = {
        ...filters,
        customer_ids: customerIds,
      }
      const response = await exportCustomers('excel', exportFilters)
      if (!response?.success) {
        throw new Error(response?.error || 'Export failed')
      }
    } catch (error) {
      addToast(error?.message || 'Export failed', 'error')
    }
  }

  const handleImportSuccess = (result) => {
    loadCustomers()
    loadStats()
    addToast(`Imported ${result.imported_count} customers successfully`, 'success')
  }

  const tabs = useMemo(() => ([
    {
      key: 'all',
      label: 'All',
      count: stats?.total_customers || 0,
    },
    {
      key: 'active',
      label: 'Active',
      count: stats?.active_customers || 0,
    },
    {
      key: 'blacklisted',
      label: 'Blacklisted',
      count: stats?.blacklisted_customers || 0,
    },
    {
      key: 'pending',
      label: 'Pending',
      count: 0,
    },
    {
      key: 'high_risk',
      label: 'High Risk',
      count: 0,
    },
  ]), [stats])

  const renderStats = () => {
    if (typeof getCustomerStats !== 'function') return null
    const averageScore = stats?.average_credit_score || 0
    const scoreTone =
      averageScore >= 700
        ? 'text-feedback-success'
        : averageScore >= 500
          ? 'text-feedback-warning'
          : 'text-feedback-danger'
    const cards = [
      {
        key: 'total',
        title: 'Total Customers',
        value: stats?.total_customers || 0,
        helper: 'All registered customer profiles',
        icon: Users,
        valueClass: 'text-brand-700',
      },
      {
        key: 'active',
        title: 'Active',
        value: stats?.active_customers || 0,
        helper: 'Eligible and active borrowers',
        icon: UserCheck,
        valueClass: 'text-feedback-success',
      },
      {
        key: 'blacklisted',
        title: 'Blacklisted',
        value: stats?.blacklisted_customers || 0,
        helper: 'Accounts under risk restriction',
        icon: UserX,
        valueClass: 'text-feedback-danger',
      },
      {
        key: 'creditScore',
        title: 'Avg. Credit Score',
        value: averageScore,
        helper: 'Portfolio credit quality indicator',
        icon: Activity,
        valueClass: scoreTone,
      },
    ]

    return (
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item, index) => (
          <article
            key={item.key}
            className="rounded-xl border bg-surface-panel p-5 shadow-soft transition-all duration-200 hover:shadow-medium animate-fade-in"
            style={{
              borderColor: 'var(--surface-border)',
              animationDelay: `${index * 40}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{item.title}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
                <item.icon className="h-4 w-4" />
              </span>
            </div>
            <p className={`mt-3 text-2xl font-semibold leading-none ${item.valueClass}`}>
              {Number(item.value || 0).toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-text-muted">{item.helper}</p>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subTitle="Manage your customer portfolio"
        extra={[
          <Button 
            key="refresh" 
            icon={<RefreshCw size={16} />} 
            onClick={loadCustomers}
            loading={customersLoading}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>,
          <Button 
            key="filter" 
            icon={<Filter size={16} />} 
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Filters</span>
          </Button>,
          hasPermission('can_manage_customers') && (
            <Button 
              key="import" 
              icon={<Upload size={16} />}
              onClick={() => setImportDialogOpen(true)}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Import</span>
            </Button>
          ),
          <Button 
            key="export" 
            icon={<Download size={16} />}
            onClick={() => setExportDialogOpen(true)}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Export</span>
          </Button>,
          hasPermission('can_manage_customers') && (
            <Link to="/customers/create" key="create">
              <Button variant="primary" icon={<Plus size={16} />} className="text-xs sm:text-sm">
                <span className="hidden sm:inline">New Customer</span>
              </Button>
            </Link>
          ),
        ].filter(Boolean)}
      />

      {renderStats()}

      <CustomerSearch
        onSelect={(customer) => {
          navigate(`/customers/${customer.id}`)
        }}
      />

      {showFilters && (
        <CustomerFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <Tabs.List className="min-w-max">
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab.key} value={tab.key} className="whitespace-nowrap">
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge
                      variant={
                        tab.key === 'blacklisted'
                          ? 'danger'
                          : tab.key === 'active'
                            ? 'success'
                            : 'secondary'
                      }
                      size="sm"
                      className="ml-1"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>
        </Tabs>

        <div className="mt-4">
          <CustomerTable
            customers={customers}
            loading={customersLoading}
            onPageChange={handlePageChange}
            onRetry={loadCustomers}
            onDelete={handleDelete}
            onBlacklist={handleBlacklist}
            onActivate={handleActivate}
            onExport={handleExport}
            onView={(id) => navigate(`/customers/${id}`)}
            onEdit={(id) => navigate(`/customers/${id}/edit`)}
          />
        </div>
      </Card>

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        filters={filters}
      />
    </div>
  )
}

export default CustomerList

