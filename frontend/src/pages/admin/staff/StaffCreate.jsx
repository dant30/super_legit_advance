import React from 'react'
import { Card, Spin } from '@components/ui'
import { PageHeader } from '@components/shared'
import { StaffForm } from '@components/admin/staff'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import staffAPI from '@api/admin'

const StaffCreate = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await staffAPI.createStaff(values)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff member created successfully',
      })
      navigate('/admin/staff')
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to create staff member',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Staff Member"
        subTitle="Create a new staff profile"
      />

      <Card className="shadow-soft">
        <StaffForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </div>
  )
}

export default StaffCreate