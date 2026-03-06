// frontend/src/pages/customers/CustomerEdit.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import PageHeader from '@components/ui/PageHeader'
import Card from '@components/ui/Card'
import Alert from '@components/ui/Alert'
import Button from '@components/ui/Button'
import Loading from '@components/ui/Loading'
import { ArrowLeft } from 'lucide-react'
import { useCustomerContext } from '@contexts/CustomerContext'
import { CustomerForm } from '@components/customers'
import { useToast } from '@contexts/ToastContext'

const CustomerEdit = () => {
  const navigate = useNavigate()
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
  }, [id, fetchCustomer])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      const response = await updateCustomer(id, formData)
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to update customer')
      }
      addToast('Customer updated successfully', 'success')
      navigate(`/customers/${id}`)
    } catch (error) {
      addToast(error?.message || 'Failed to update customer', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  if (selectedCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-64" role="status" aria-live="polite" aria-busy="true">
        <Loading size="large" />
        <span className="sr-only">Loading customer details</span>
      </div>
    )
  }

  if (!selectedCustomer) {
    return (
      <Alert
        type="error"
        message="Customer not found"
        description="The customer record you are trying to edit does not exist or has been deleted."
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
        message="Update Customer Record Carefully"
        description="Changes to customer information can affect loan eligibility, pricing, and collections."
        className="mb-6"
      />

      <Card>
        <CustomerForm
          customerId={id}
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

