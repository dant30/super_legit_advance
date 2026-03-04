// frontend/src/pages/customers/CustomerEdit.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageHeader, Card, Alert, Button } from '@components/ui'
import { Loading } from '@components/ui'
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
      await updateCustomer(id, formData)
      addToast('Borrower updated successfully', 'success')
      // Redirect to customer detail page
      navigate(`/customers/${id}`)
    } catch (error) {
      addToast('Failed to update borrower', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  if (selectedCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="large" />
      </div>
    )
  }

  if (!selectedCustomer) {
    return (
      <Alert
        type="error"
        message="Borrower not found"
        description="The borrower record you are trying to edit does not exist or has been deleted."
        action={
          <Link to="/customers">
            <Button type="primary">Back to Borrowers</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Borrower"
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
        message="Update Borrower Record Carefully"
        description="Changes to borrower information can affect loan eligibility, pricing, and collections."
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

