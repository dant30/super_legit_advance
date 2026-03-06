import React, { useState, useEffect } from 'react'
import Alert from '@components/ui/Alert'
import Card from '@components/ui/Card'
import Spin from '@components/ui/Loading'
import PageHeader from '@components/ui/PageHeader'
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
  const [submitError, setSubmitError] = useState('')
  const [supervisorUsers, setSupervisorUsers] = useState([])

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true)
      try {
        const [data, users] = await Promise.all([
          staffAPI.getStaffById(id),
          staffAPI.getEligibleStaffUsers(),
        ])
        setStaff(data)
        setSupervisorUsers(users)
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error?.response?.data?.detail || error?.message || 'Failed to fetch staff',
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
    setSubmitError('')
    try {
      await staffAPI.updateStaff(id, values)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff profile updated successfully',
      })
      navigate(`/admin/staff/${id}`)
    } catch (error) {
      setSubmitError(
        error?.response?.data?.detail ||
        error?.response?.data?.work_email?.[0] ||
        error?.response?.data?.work_phone?.[0] ||
        error?.message ||
        'Failed to update staff profile'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spin />

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${staff?.user_details?.full_name || 'Staff Profile'}`}
        subTitle={staff?.employee_id}
      />

      <Card className="shadow-soft">
        {submitError && (
          <Alert
            className="mb-6"
            variant="danger"
            title="Profile update failed"
            description={submitError}
          />
        )}
        <StaffForm
          initialData={staff}
          onSubmit={handleSubmit}
          loading={submitting}
          onCancel={() => navigate(`/admin/staff/${id}`)}
          supervisorUsers={supervisorUsers}
          submitError={submitError}
        />
      </Card>
    </div>
  )
}

export default StaffEdit
