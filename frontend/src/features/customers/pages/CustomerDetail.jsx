// frontend/src/pages/customers/CustomerDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Tabs from '@components/ui/Tabs'
import Alert from '@components/ui/Alert'
import Spin from '@components/ui/Loading'
import Modal from '@components/ui/Modal'
import Descriptions from '@components/ui/Descriptions'
import Badge from '@components/ui/Badge'
import PageHeader from '@components/ui/PageHeader'
import { 
  ArrowLeft, Edit, Trash2, UserCheck, UserX, 
  FileText, Download, Printer, Share2,
  CreditCard, Users, Building, FileSpreadsheet 
} from 'lucide-react'
import { useCustomerContext } from '@contexts/CustomerContext'
import { 
  CustomerProfile, 
  EmploymentForm,
  GuarantorsList,
  DocumentUpload,
  RiskIndicator 
} from '@components/customers'
import { useToast } from '@contexts/ToastContext'
import { useAuth } from '@features/auth/hooks/useAuth'
import { formatCurrency, formatDate } from '@utils/formatters'

const CustomerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    selectedCustomer, 
    selectedCustomerLoading, 
    fetchCustomer,
    deleteCustomer,
    blacklistCustomer,
    activateCustomer,
    getGuarantors,
    guarantors,
    guarantorsLoading
  } = useCustomerContext()
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [actionModal, setActionModal] = useState({ open: false, type: '', title: '' })
  const [blacklistReason, setBlacklistReason] = useState('')

  useEffect(() => {
    if (id) {
      fetchCustomer(id)
      getGuarantors(id)
    }
  }, [id, fetchCustomer, getGuarantors])

  const handleDelete = async () => {
    try {
      const response = await deleteCustomer(id)
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to delete customer')
      }
      addToast('Customer deleted successfully', 'success')
      navigate('/customers')
    } catch (error) {
      addToast(error?.message || 'Failed to delete customer', 'error')
    }
  }

  const handleBlacklist = async () => {
    try {
      const response = await blacklistCustomer(id, blacklistReason || 'Manual blacklisting by admin')
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to blacklist customer')
      }
      addToast('Customer blacklisted successfully', 'success')
      setBlacklistReason('')
      setActionModal({ open: false, type: '', title: '' })
      fetchCustomer(id)
    } catch (error) {
      addToast(error?.message || 'Failed to blacklist customer', 'error')
    }
  }

  const handleActivate = async () => {
    try {
      const response = await activateCustomer(id)
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to activate customer')
      }
      addToast('Customer activated successfully', 'success')
      setBlacklistReason('')
      setActionModal({ open: false, type: '', title: '' })
      fetchCustomer(id)
    } catch (error) {
      addToast(error?.message || 'Failed to activate customer', 'error')
    }
  }

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <FileText size={16} />,
    },
    {
      key: 'loans',
      label: 'Loans',
      icon: <CreditCard size={16} />,
    },
    {
      key: 'guarantors',
      label: 'Guarantors',
      icon: <Users size={16} />,
    },
    {
      key: 'documents',
      label: 'Documents',
      icon: <FileSpreadsheet size={16} />,
    },
    {
      key: 'employment',
      label: 'Employment',
      icon: <Building size={16} />,
    },
    {
      key: 'risk',
      label: 'Risk Assessment',
      icon: <FileText size={16} />,
    },
  ]

  const renderActionButtons = () => {
    const isBlacklisted = selectedCustomer?.status === 'BLACKLISTED'

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button icon={<Edit size={16} />}>
          <Link to={`/customers/${id}/edit`}>Edit</Link>
        </Button>
        
        {isBlacklisted ? (
          <Button 
            variant="primary" 
            icon={<UserCheck size={16} />}
            onClick={() => setActionModal({ 
              open: true, 
              type: 'activate', 
              title: 'Activate Customer' 
            })}
          >
            Activate
          </Button>
        ) : (
          <Button 
            variant="danger"
            icon={<UserX size={16} />}
            onClick={() => setActionModal({ 
              open: true, 
              type: 'blacklist', 
              title: 'Blacklist Customer' 
            })}
          >
            Blacklist
          </Button>
        )}
        
        <Button icon={<Printer size={16} />}>Print</Button>
        <Button icon={<Share2 size={16} />}>Share</Button>
        <Button icon={<Download size={16} />}>Export</Button>
        
        {hasPermission('can_manage_customers') && (
          <Button 
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={() => setActionModal({ 
              open: true, 
              type: 'delete', 
              title: 'Delete Customer' 
            })}
          >
            Delete
          </Button>
        )}
      </div>
    )
  }

  if (selectedCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-64" role="status" aria-live="polite" aria-busy="true">
        <Spin size="large" />
        <span className="sr-only">Loading customer profile</span>
      </div>
    )
  }

  if (!selectedCustomer) {
    return (
      <Alert
        type="error"
        message="Customer not found"
        description="The customer profile you are looking for does not exist or has been deleted."
        action={
          <Link to="/customers">
            <Button variant="primary">Back to Customers</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Profile"
        subTitle={`Customer ID: ${selectedCustomer.customer_number}`}
        extra={[renderActionButtons()]}
      />

      <div className="rounded-xl border bg-white px-4 py-4 shadow-soft sm:px-6" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{selectedCustomer.full_name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  selectedCustomer.status === 'ACTIVE'
                    ? 'success'
                    : selectedCustomer.status === 'BLACKLISTED'
                      ? 'danger'
                      : 'secondary'
                }
              >
                {selectedCustomer.status}
              </Badge>
              <span className="text-sm text-gray-600">
                Member since {formatDate(selectedCustomer.registration_date, 'short')}
              </span>
            </div>
          </div>
          <Link to="/customers">
            <Button icon={<ArrowLeft size={16} />}>
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <Tabs.List className="min-w-max">
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab.key} value={tab.key} icon={tab.icon}>
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>
        </Tabs>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <CustomerProfile 
              customer={selectedCustomer} 
              loading={selectedCustomerLoading}
              customerId={id}
            />
          )}

          {activeTab === 'loans' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Loan History</h3>
              {/* Loan history component would go here */}
              <Alert
                type="info"
                message="Loan Management"
                description="View and manage this customer loan portfolio from this section."
              />
            </div>
          )}

          {activeTab === 'guarantors' && (
            <GuarantorsList
              guarantors={guarantors}
              customerId={id}
              onRefresh={() => getGuarantors(id)}
              loading={guarantorsLoading}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentUpload
              customerId={id}
              existingDocuments={selectedCustomer.documents || []}
              readOnly={!hasPermission('can_manage_customers')}
            />
          )}

          {activeTab === 'employment' && <EmploymentForm customerId={id} />}

          {activeTab === 'risk' && (
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Risk Assessment</h3>
                    <p className="text-sm text-gray-600">
                      Current borrower risk profile based on score and status.
                    </p>
                  </div>
                  <RiskIndicator
                    riskLevel={selectedCustomer.risk_level}
                    score={selectedCustomer.credit_score}
                    size="large"
                  />
                </div>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Risk Level">
                    {selectedCustomer.risk_level || 'Not assessed'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Credit Score">
                    {selectedCustomer.credit_score ?? 'Not available'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {selectedCustomer.status || 'Unknown'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Outstanding Balance">
                    {formatCurrency(selectedCustomer.outstanding_balance || 0)}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Action Modals */}
      <Modal
        title={actionModal.title}
        open={actionModal.open}
        onCancel={() => setActionModal({ open: false, type: '', title: '' })}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setActionModal({ open: false, type: '', title: '' })}
          >
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            variant={actionModal.type === 'delete' || actionModal.type === 'blacklist' ? 'danger' : 'primary'}
            onClick={() => {
              if (actionModal.type === 'delete') handleDelete()
              if (actionModal.type === 'blacklist') handleBlacklist()
              if (actionModal.type === 'activate') handleActivate()
            }}
          >
            Confirm
          </Button>,
        ]}
      >
        {actionModal.type === 'delete' && (
          <div>
            <Alert
              type="error"
              message="Warning: This action cannot be undone!"
              description="Deleting this customer will remove all related records including loans and documents."
              className="mb-4"
            />
            <p>Are you sure you want to Delete Customer <strong>{selectedCustomer.full_name}</strong>?</p>
          </div>
        )}
        
        {actionModal.type === 'blacklist' && (
          <div>
            <Alert
              type="warning"
              message="Customer Blacklisting"
              description="Blacklisted customers cannot apply for new loans and may have existing loans restricted."
              className="mb-4"
            />
            <p>Are you sure you want to Blacklist Customer <strong>{selectedCustomer.full_name}</strong>?</p>
            <div className="mt-4">
              <label htmlFor="blacklist-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for blacklisting
              </label>
              <textarea 
                id="blacklist-reason"
                value={blacklistReason}
                onChange={(event) => setBlacklistReason(event.target.value)}
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>
          </div>
        )}
        
        {actionModal.type === 'activate' && (
          <div>
            <Alert
              type="info"
              message="Customer Activation"
              description="Activating a customer will restore eligibility for new loan applications."
              className="mb-4"
            />
            <p>Are you sure you want to Activate Customer <strong>{selectedCustomer.full_name}</strong>?</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CustomerDetail



