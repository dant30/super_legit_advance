// frontend/src/pages/customers/CustomerList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Tabs from '@components/ui/Tabs'
import Badge from '@components/ui/Badge'
import Modal from '@components/ui/Modal'
import PageHeader from '@components/ui/PageHeader'
import { Plus, Download, Upload, Filter, RefreshCw, Users, UserCheck, UserX, Activity } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerContext } from '@contexts/CustomerContext'
import { CustomerTable, CustomerFilters, CustomerSearch } from '@components/customers'
import { ImportDialog, ExportDialog } from '@components/customers'
import { useAuth } from '@hooks/useAuth'
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
  const [actionModal, setActionModal] = useState({ open: false, type: '', title: '' })
  const page = customersPagination?.page ?? 1
  const pageSize = customersPagination?.page_size ?? 20

  const loadCustomers = useCallback(async () => {
    if (typeof fetchCustomers !== 'function') return
    const params = {
      ...filters,
      status: activeTab === 'all' ? '' : activeTab.toUpperCase(),
      page,
      page_size: pageSize,
    }
    await fetchCustomers(params)
  }, [fetchCustomers, filters, activeTab, page, pageSize])

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
      fetchCustomers({
        ...filters,
        status: activeTab === 'all' ? '' : activeTab.toUpperCase(),
        page,
        page_size: pageSize,
      })
    }
  }

  const handleSearch = async (query) => {
    if (query) {
      // Implement search logic
    } else {
      loadCustomers()
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
          >
            Refresh
          </Button>,
          <Button 
            key="filter" 
            icon={<Filter size={16} />} 
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>,
          hasPermission('can_manage_customers') && (
            <Button 
              key="import" 
              icon={<Upload size={16} />}
              onClick={() => setImportDialogOpen(true)}
            >
              Import
            </Button>
          ),
          <Button 
            key="export" 
            icon={<Download size={16} />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>,
          hasPermission('can_manage_customers') && (
            <Link to="/customers/create" key="create">
              <Button type="primary" icon={<Plus size={16} />}>
                New Customer
              </Button>
            </Link>
          ),
        ].filter(Boolean)}
      />

      {renderStats()}

      <CustomerSearch
        onSearch={handleSearch}
        onSelect={(customer) => {
          // Handle customer selection
          console.log('Selected customer:', customer)
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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabs.map(tab => ({
            key: tab.key,
            label: (
              <span>
                {tab.label}
                {tab.count > 0 && (
                  <Badge
                    count={tab.count}
                    style={{ 
                      marginLeft: 8,
                      backgroundColor: tab.key === 'blacklisted' ? '#ef4444' : 
                                     tab.key === 'active' ? '#10b981' : '#6b7280'
                    }}
                  />
                )}
              </span>
            ),
          }))}
        />

        <div className="mt-4">
          <CustomerTable
            customers={customers}
            loading={customersLoading}
            pagination={customersPagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
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

      {/* Action Modal */}
      <Modal
        title={actionModal.title}
        open={actionModal.open}
        onCancel={() => setActionModal({ open: false, type: '', title: '' })}
        footer={[
          <Button key="cancel" onClick={() => setActionModal({ open: false, type: '', title: '' })}>
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            danger={actionModal.type === 'delete'}
            onClick={() => {
              // Handle action confirmation
              setActionModal({ open: false, type: '', title: '' })
            }}
          >
            Confirm
          </Button>,
        ]}
      >
        {actionModal.type === 'delete' && (
          <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
        )}
        {actionModal.type === 'blacklist' && (
          <p>Are you sure you want to blacklist this customer?</p>
        )}
      </Modal>
    </div>
  )
}

export default CustomerList

