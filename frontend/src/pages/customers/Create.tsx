// frontend/src/pages/customers/Create.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast/useToast'
import type { CustomerFormData } from '@/types/customers'

const CustomerCreate: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createCustomer } = useCustomers()

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomer(data)
      toast({
        title: 'Success',
        description: 'Customer created successfully'
      })
      navigate('/customers')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create customer',
        variant: 'destructive'
      })
    }
  }

  const handleCancel = () => {
    navigate('/customers')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: 'Create Customer', href: '#' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">Create New Customer</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to add a new customer to the system
          </p>
        </div>
      </div>

      <CustomerForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default CustomerCreate