// frontend/src/pages/customers/Edit.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Loading } from '@/components/shared/Loading'
import { Error } from '@/components/shared/Error'
import { useToast } from '@/components/ui/Toast/useToast'
import type { CustomerUpdateData } from '@/types/customers'

const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    selectedCustomer,
    selectedCustomerLoading,
    selectedCustomerError,
    fetchCustomer,
    updateCustomer,
    clearSelectedCustomerError
  } = useCustomers()

  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (data: CustomerUpdateData) => {
    if (!id) return

    setLoading(true)
    try {
      await updateCustomer(id, data)
      toast({
        title: 'Success',
        description: 'Customer updated successfully'
      })
      navigate(`/customers/${id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update customer',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/customers/${id}`)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: selectedCustomer?.full_name || 'Customer', href: `/customers/${id}` },
    { label: 'Edit', href: '#' }
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
        actionText="Back to Customer"
        onAction={() => navigate(`/customers/${id}`)}
      />
    )
  }

  // Convert Customer to CustomerFormData
  const initialData = {
    first_name: selectedCustomer.first_name,
    last_name: selectedCustomer.last_name,
    middle_name: selectedCustomer.middle_name,
    date_of_birth: selectedCustomer.date_of_birth,
    gender: selectedCustomer.gender,
    marital_status: selectedCustomer.marital_status,
    id_type: selectedCustomer.id_type,
    id_number: selectedCustomer.id_number,
    id_expiry_date: selectedCustomer.id_expiry_date,
    nationality: selectedCustomer.nationality,
    phone_number: selectedCustomer.phone_number,
    email: selectedCustomer.email,
    physical_address: selectedCustomer.physical_address,
    postal_address: selectedCustomer.postal_address,
    county: selectedCustomer.county,
    sub_county: selectedCustomer.sub_county,
    ward: selectedCustomer.ward,
    bank_name: selectedCustomer.bank_name,
    bank_account_number: selectedCustomer.bank_account_number,
    bank_branch: selectedCustomer.bank_branch,
    notes: selectedCustomer.notes,
    referred_by: selectedCustomer.referred_by
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-gray-600 mt-2">
            Update customer information below
          </p>
        </div>
      </div>

      <CustomerForm
        initialData={initialData}
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}

export default CustomerEdit