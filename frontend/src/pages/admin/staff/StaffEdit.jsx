import React, { useState, useEffect } from 'react'
import { Card, Spin } from '@components/ui'
import { PageHeader } from '@components/shared'
import { StaffForm } from '@components/admin/staff'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import staffAPI from '@api/admin'

const StaffEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true)
      try {
        const data = await staffAPI.getStaff(id)
        setStaff(data)
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error?.message || 'Failed to fetch staff',
        })
        navigate('/admin/staff')
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [id, addToast, navigate])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      await staffAPI.updateStaff(id, values)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff member updated successfully',
      })
      navigate(`/admin/staff/${id}`)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to update staff',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spin />

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${staff?.full_name || 'Staff Member'}`}
        subTitle={staff?.employee_id}
      />

      <Card className="shadow-soft">
        <StaffForm
          initialData={staff}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </Card>
    </div>
  )
}

export default StaffEdit