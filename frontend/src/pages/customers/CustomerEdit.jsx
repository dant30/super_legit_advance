// frontend/src/pages/customers/CustomerEdit.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader, Card, Alert, Spin } from '@components/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { useCustomerContext } from '@contexts/CustomerContext'
import { CustomerForm } from '@components/customers'
import { useToast } from '@contexts/ToastContext'

const CustomerEdit = () => {
  const { id } = useParams()
  const { 
    selectedCustomer, 
    selectedCustomerLoading, 
    fetchCustomer, 
    updateCustomer 
  } = useCustomerContext()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCustomer(id)
    }
  }, [id])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await updateCustomer(id, formData)
      addToast('Customer updated successfully', 'success')
      // Redirect to customer detail page
      window.location.href = `/customers/${id}`
    } catch (error) {
      addToast('Failed to update customer', 'error')
      throw error
    } finally {
      setLoading(false)
    }
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
        description="The customer you are trying to edit does not exist or has been deleted."
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
        title="Edit Customer"
        subTitle={`Editing: ${selectedCustomer.full_name}`}
        extra={[
          <Link to={`/customers/${id}`} key="back">
            <Button icon={<ArrowLeft size={16} />}>
              Back to Profile
            </Button>
          </Link>,
        ]}
      />

      <Alert
        type="warning"
        message="Update Information Carefully"
        description="Changes to customer information may affect loan applications and risk assessments."
        className="mb-6"
      />

      <Card>
        <CustomerForm
          initialData={selectedCustomer}
          onSubmit={handleSubmit}
          loading={loading || selectedCustomerLoading}
          mode="edit"
        />
      </Card>
    </div>
  )
}

export default CustomerEdit