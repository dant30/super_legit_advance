// frontend/src/pages/customers/CustomerDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Card, Button, Space, Tabs, 
  Alert, Spin, Modal, Descriptions, Badge 
} from '@components/ui'
import PageHeader from '@components/shared/PageHeader'
import { 
  ArrowLeft, Edit, Trash2, UserCheck, UserX, 
  FileText, Download, Printer, Share2, MoreVertical,
  CreditCard, Users, Building, FileSpreadsheet 
} from 'lucide-react'
import { useCustomerContext } from '@contexts/CustomerContext'
import { 
  CustomerProfile, 
  CustomerStats, 
  GuarantorsList,
  DocumentUpload,
  RiskIndicator 
} from '@components/customers'
import { useToast } from '@contexts/ToastContext'
import { useAuth } from '@hooks/useAuth'
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

  useEffect(() => {
    if (id) {
      fetchCustomer(id)
      getGuarantors(id)
    }
  }, [id, fetchCustomer, getGuarantors])

  const handleDelete = async () => {
    try {
      await deleteCustomer(id)
      addToast('Customer deleted successfully', 'success')
      navigate('/customers')
    } catch (error) {
      addToast('Failed to delete customer', 'error')
    }
  }

  const handleBlacklist = async () => {
    try {
      await blacklistCustomer(id, 'Manual blacklisting by admin')
      addToast('Customer blacklisted successfully', 'success')
      setActionModal({ open: false, type: '', title: '' })
      fetchCustomer(id)
    } catch (error) {
      addToast('Failed to blacklist customer', 'error')
    }
  }

  const handleActivate = async () => {
    try {
      await activateCustomer(id)
      addToast('Customer activated successfully', 'success')
      setActionModal({ open: false, type: '', title: '' })
      fetchCustomer(id)
    } catch (error) {
      addToast('Failed to activate customer', 'error')
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
      <Space>
        <Button icon={<Edit size={16} />}>
          <Link to={`/customers/${id}/edit`}>Edit</Link>
        </Button>
        
        {isBlacklisted ? (
          <Button 
            type="primary" 
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
            danger
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
            danger
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
      </Space>
    )
  }

  if (selectedCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!selectedCustomer) {
    return (
      <Alert
        type="error"
        message="Customer not found"
        description="The customer you are looking for does not exist or has been deleted."
        action={
          <Link to="/customers">
            <Button type="primary">Back to Customers</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Details"
        subTitle={`Customer ID: ${selectedCustomer.customer_number}`}
        extra={renderActionButtons()}
        footer={
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{selectedCustomer.full_name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge color={
                  selectedCustomer.status === 'ACTIVE' ? 'green' :
                  selectedCustomer.status === 'BLACKLISTED' ? 'red' : 'gray'
                }>
                  {selectedCustomer.status}
                </Badge>
                <span className="text-gray-600">
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
        }
      />

      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabs} 
        />

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
                description="View and manage customer loans from this section."
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

          {activeTab === 'employment' && selectedCustomer.employment && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Occupation">
                  {selectedCustomer.employment.occupation || 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Monthly Income">
                  {formatCurrency(selectedCustomer.employment.monthly_income || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Employer">
                  {selectedCustomer.employment.employer_name || 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Employment Start">
                  {formatDate(selectedCustomer.employment.employment_start_date, 'short')}
                </Descriptions.Item>
                <Descriptions.Item label="Employer Phone">
                  {selectedCustomer.employment.employer_phone || 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Employer Address">
                  {selectedCustomer.employment.employer_address || 'Not specified'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          {activeTab === 'risk' && (
            <RiskIndicator
              creditScore={selectedCustomer.credit_score || 0}
              riskFactors={selectedCustomer.risk_factors || []}
              onReview={() => {
                // Handle risk review
              }}
            />
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
            type="primary"
            danger={actionModal.type === 'delete' || actionModal.type === 'blacklist'}
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
              description="Deleting this customer will remove all their data including loans and documents."
              className="mb-4"
            />
            <p>Are you sure you want to delete customer <strong>{selectedCustomer.full_name}</strong>?</p>
          </div>
        )}
        
        {actionModal.type === 'blacklist' && (
          <div>
            <Alert
              type="warning"
              message="Customer Blacklisting"
              description="Blacklisted customers cannot apply for new loans and may have existing loans frozen."
              className="mb-4"
            />
            <p>Are you sure you want to blacklist customer <strong>{selectedCustomer.full_name}</strong>?</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for blacklisting
              </label>
              <textarea 
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
              description="Activating a customer will restore their ability to apply for loans."
              className="mb-4"
            />
            <p>Are you sure you want to activate customer <strong>{selectedCustomer.full_name}</strong>?</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CustomerDetail
