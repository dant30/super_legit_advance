// frontend/src/pages/customers/CustomerCreate.jsx
import React from 'react'
import { Card, Alert, Button } from '@components/ui'
import { PageHeader } from '@components/ui'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCustomerContext } from '@contexts/CustomerContext'
import { CustomerForm } from '@components/customers'
import { useToast } from '@contexts/ToastContext'

const CustomerCreate = () => {
  const { createCustomer, customersLoading } = useCustomerContext()
  const { addToast } = useToast()

  const handleSubmit = async (formData) => {
    try {
      await createCustomer(formData)
      addToast('Customer created successfully', 'success')
      // Redirect to customer list or detail page
      window.location.href = '/customers'
    } catch (error) {
      addToast('Failed to create customer', 'error')
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Customer"
        subTitle="Add a new customer to the lending portfolio"
        extra={[
          <Link to="/customers" key="back">
            <Button icon={<ArrowLeft size={16} />}>
              Back to List
            </Button>
          </Link>,
        ]}
      />

      <Alert
        type="info"
        message="Important Information"
        description="Complete all required customer fields to support accurate credit and repayment decisions."
        className="mb-6"
      />

      <Card>
        <CustomerForm
          onSubmit={handleSubmit}
          loading={customersLoading}
          mode="create"
        />
      </Card>
    </div>
  )
}

export default CustomerCreate

