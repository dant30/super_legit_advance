// frontend/src/pages/customers/Detail.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { CustomerProfile } from '@/components/customers/CustomerProfile'
import { GuarantorsList } from '@/components/customers/GuarantorsList'
import { DocumentUpload } from '@/components/customers/DocumentUpload'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/shared/Loading'
import { Error } from '@/components/shared/Error'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { useToast } from '@/components/ui/Toast/useToast'

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const {
    selectedCustomer,
    selectedCustomerLoading,
    selectedCustomerError,
    fetchCustomer,
    blacklistCustomer,
    activateCustomer,
    clearSelectedCustomerError
  } = useCustomers()

  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      loadCustomer()
    }
  }, [id])

  const loadCustomer = async () => {
    try {
      await fetchCustomer(id!)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customer details',
        variant: 'destructive'
      })
    }
  }

  const handleBlacklist = async () => {
    if (!selectedCustomer || !id) return

    const reason = prompt('Please enter reason for blacklisting:')
    if (!reason) return

    try {
      await blacklistCustomer(id, reason)
      toast({
        title: 'Customer Blacklisted',
        description: 'Customer has been successfully blacklisted'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to blacklist customer',
        variant: 'destructive'
      })
    }
  }

  const handleActivate = async () => {
    if (!selectedCustomer || !id) return

    try {
      await activateCustomer(id)
      toast({
        title: 'Customer Activated',
        description: 'Customer has been successfully activated'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate customer',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = () => {
    navigate(`/customers/${id}/edit`)
  }

  const handleViewEmployment = () => {
    navigate(`/customers/${id}/employment`)
  }

  const handleViewGuarantors = () => {
    navigate(`/customers/${id}/guarantors`)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: selectedCustomer?.full_name || 'Customer', href: '#' }
  ]

  if (selectedCustomerLoading) {
    return <Loading message="Loading customer details..." />
  }

  if (selectedCustomerError || !selectedCustomer) {
    return (
      <Error
        message={selectedCustomerError || 'Customer not found'}
        onRetry={loadCustomer}
        onDismiss={clearSelectedCustomerError}
        actionText="Back to Customers"
        onAction={() => navigate('/customers')}
      />
    )
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <CustomerProfile customer={selectedCustomer} />
      )
    },
    {
      id: 'guarantors',
      label: 'Guarantors',
      content: (
        <GuarantorsList
          customerId={selectedCustomer.id}
          guarantors={selectedCustomer.guarantors || []}
          onAdd={() => handleViewGuarantors()}
        />
      )
    },
    {
      id: 'loans',
      label: 'Loans',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Loan History</h3>
          {selectedCustomer.loan_statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-sm text-gray-500">Total Loans</div>
                <div className="text-2xl font-bold">
                  {selectedCustomer.loan_statistics.total_loans}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Active Loans</div>
                <div className="text-2xl font-bold">
                  {selectedCustomer.loan_statistics.active_loans}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Total Borrowed</div>
                <div className="text-2xl font-bold">
                  KES {selectedCustomer.loan_statistics.total_borrowed.toLocaleString()}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Outstanding</div>
                <div className="text-2xl font-bold">
                  KES {selectedCustomer.loan_statistics.total_outstanding.toLocaleString()}
                </div>
              </Card>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'documents',
      label: 'Documents',
      content: (
        <DocumentUpload
          customerId={selectedCustomer.id}
          existingDocuments={{
            id_document: selectedCustomer.id_document,
            passport_photo: selectedCustomer.passport_photo,
            signature: selectedCustomer.signature
          }}
        />
      )
    },
    {
      id: 'employment',
      label: 'Employment',
      content: (
        <div className="p-4">
          {selectedCustomer.employment ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Employment Type</label>
                  <div className="font-medium">{selectedCustomer.employment.employment_type}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Occupation</label>
                  <div className="font-medium">{selectedCustomer.employment.occupation}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Monthly Income</label>
                  <div className="font-medium">
                    KES {selectedCustomer.employment.monthly_income.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Verification Status</label>
                  <div className="font-medium">
                    {selectedCustomer.employment.is_verified ? 'Verified' : 'Not Verified'}
                  </div>
                </div>
              </div>
              <Button onClick={handleViewEmployment}>
                View/Edit Employment Details
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No employment information recorded</p>
              <Button onClick={handleViewEmployment}>
                Add Employment Information
              </Button>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCustomer.full_name}
            </h1>
            <p className="text-gray-600 mt-2">
              Customer #{selectedCustomer.customer_number}
            </p>
          </div>
          <div className="flex space-x-3">
            {isAdmin() && (
              <>
                {selectedCustomer.status === 'BLACKLISTED' ? (
                  <Button
                    variant="outline"
                    onClick={handleActivate}
                    className="text-green-600"
                  >
                    Activate Customer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleBlacklist}
                    className="text-red-600"
                  >
                    Blacklist Customer
                  </Button>
                )}
                <Button onClick={handleEdit}>Edit Customer</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default CustomerDetail