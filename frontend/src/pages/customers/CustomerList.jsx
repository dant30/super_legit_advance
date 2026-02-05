// frontend/src/pages/customers/CustomerList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Button, Space, Card, Row, Col, 
  Statistic, Tabs, Badge, Modal 
} from '@components/ui'
import { PageHeader } from '@components/shared'
import { Plus, Download, Upload, Filter, RefreshCw, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerContext } from '@contexts/CustomerContext'
import { CustomerTable, CustomerFilters, CustomerSearch, CustomerStats } from '@components/customers'
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
  const [searchQuery, setSearchQuery] = useState('')
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
    setSearchQuery(query)
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
    setSearchQuery('')
    setActiveTab('all')
  }

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id)
      addToast('Customer deleted successfully', 'success')
    } catch (error) {
      addToast('Failed to delete customer', 'error')
    }
  }

  const handleBlacklist = async (id) => {
    try {
      await blacklistCustomer(id, 'Manual blacklisting by admin')
      addToast('Customer blacklisted successfully', 'success')
    } catch (error) {
      addToast('Failed to blacklist customer', 'error')
    }
  }

  const handleActivate = async (id) => {
    try {
      await activateCustomer(id)
      addToast('Customer activated successfully', 'success')
    } catch (error) {
      addToast('Failed to activate customer', 'error')
    }
  }

  const handleExport = async (customerIds = null) => {
    try {
      const exportFilters = {
        ...filters,
        customer_ids: customerIds,
      }
      await exportCustomers('excel', exportFilters)
    } catch (error) {
      addToast('Export failed', 'error')
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
    return (
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats?.total_customers || 0}
              prefix={<Users size={20} />}
              valueStyle={{ color: '#3f51b5' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats?.active_customers || 0}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Blacklisted"
              value={stats?.blacklisted_customers || 0}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Credit Score"
              value={stats?.average_credit_score || 0}
              valueStyle={{ 
                color: (stats?.average_credit_score || 0) >= 700 ? '#10b981' : 
                       (stats?.average_credit_score || 0) >= 500 ? '#f59e0b' : '#ef4444'
              }}
            />
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subTitle="Manage your customer database"
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
