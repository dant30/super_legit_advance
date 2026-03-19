import React from 'react'
import Alert from '@components/ui/Alert'
import Card from '@components/ui/Card'
import PageHeader from '@components/ui/PageHeader'
import { StaffForm } from '@components/admin/staff'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import staffAPI from '@api/admin'

const StaffCreate = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [initializing, setInitializing] = React.useState(true)
  const [eligibleUsers, setEligibleUsers] = React.useState([])
  const [supervisorUsers, setSupervisorUsers] = React.useState([])
  const [submitError, setSubmitError] = React.useState('')

  React.useEffect(() => {
    let active = true

    const loadOptions = async () => {
      setInitializing(true)
      try {
        const [profiles, users] = await Promise.all([
          staffAPI.getStaff({ page_size: 100 }),
          staffAPI.getEligibleStaffUsers(),
        ])

        if (!active) return

        const existingProfileUserIds = new Set((profiles.items || []).map((profile) => profile.user))
        setEligibleUsers(users.filter((user) => !existingProfileUserIds.has(user.id)))
        setSupervisorUsers(users)
      } catch (error) {
        if (!active) return
        setSubmitError(error?.response?.data?.detail || error?.message || 'Failed to load staff user options.')
      } finally {
        if (active) {
          setInitializing(false)
        }
      }
    }

    loadOptions()

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (values) => {
    setLoading(true)
    setSubmitError('')
    try {
      await staffAPI.createStaff(values)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff profile created successfully',
      })
      navigate('/admin/staff')
    } catch (error) {
      const message =
        error?.response?.data?.user_id?.[0] ||
        error?.response?.data?.employee_id?.[0] ||
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to create staff profile'
      setSubmitError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Staff Profile"
        subTitle="Link an existing staff user to an operational staff profile"
      />

      <Card className="shadow-soft">
        {submitError && !initializing && (
          <Alert
            className="mb-6"
            variant="danger"
            title="Unable to load staff creation form"
            description={submitError}
          />
        )}

        {!initializing && eligibleUsers.length === 0 ? (
          <Alert
            variant="info"
            title="No eligible staff users available"
            description="Create or activate a user with role admin, staff, or loan officer before creating a staff profile."
          />
        ) : (
          <StaffForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/staff')}
            loading={loading || initializing}
            eligibleUsers={eligibleUsers}
            supervisorUsers={supervisorUsers}
            submitError={submitError}
          />
        )}
      </Card>
    </div>
  )
}

export default StaffCreate

