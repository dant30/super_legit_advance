import React, { useEffect, useMemo, useState } from 'react'
import Alert from '@components/ui/Alert'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Loading from '@components/ui/Loading'
import Modal from '@components/ui/Modal'
import PageHeader from '@components/ui/PageHeader'
import Select from '@components/ui/Select'
import Input from '@components/ui/Input'
import { StaffDetail as StaffDetailComponent } from '@components/admin/staff'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import staffAPI from '@api/admin'

const StaffDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supervisorUsers, setSupervisorUsers] = useState([])
  const [performanceOpen, setPerformanceOpen] = useState(false)
  const [performanceValues, setPerformanceValues] = useState({ rating: '', review_date: '' })
  const [performanceSaving, setPerformanceSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadDetail = React.useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [profile, users] = await Promise.all([
        staffAPI.getStaffById(id),
        staffAPI.getEligibleStaffUsers(),
      ])

      setStaff(profile)
      setSupervisorUsers(users)
      setPerformanceValues({
        rating: profile?.performance_rating || '',
        review_date: profile?.last_performance_review || '',
      })
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || requestError?.message || 'Failed to fetch staff profile.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const supervisorOptions = useMemo(
    () =>
      supervisorUsers
        .filter((user) => user.id !== staff?.user)
        .map((user) => ({
          value: user.id,
          label: `${user.full_name || user.email} (${user.role_display || user.role})`,
        })),
    [staff?.user, supervisorUsers]
  )

  const handleAssignSupervisor = async (event) => {
    const supervisorId = event.target.value
    if (!supervisorId) {
      return
    }

    try {
      const updated = await staffAPI.assignSupervisor(id, supervisorId)
      setStaff(updated)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Supervisor assigned successfully',
      })
    } catch (requestError) {
      addToast({
        type: 'error',
        title: 'Error',
        message: requestError?.response?.data?.detail || requestError?.message || 'Failed to assign supervisor',
      })
    }
  }

  const handleSavePerformance = async (event) => {
    event.preventDefault()
    setPerformanceSaving(true)

    try {
      const updated = await staffAPI.updateStaffPerformance(id, performanceValues)
      setStaff(updated)
      setPerformanceOpen(false)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Performance updated successfully',
      })
    } catch (requestError) {
      addToast({
        type: 'error',
        title: 'Error',
        message: requestError?.response?.data?.detail || requestError?.message || 'Failed to update performance',
      })
    } finally {
      setPerformanceSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await staffAPI.deleteStaff(id)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff profile deleted successfully',
      })
      navigate('/admin/staff')
    } catch (requestError) {
      addToast({
        type: 'error',
        title: 'Error',
        message: requestError?.response?.data?.detail || requestError?.message || 'Failed to delete staff profile',
      })
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!staff) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff Details" subTitle="Profile unavailable" />
        <Alert variant="danger" title="Unable to load staff profile" description={error} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={staff?.user_details?.full_name || 'Staff Details'}
        subTitle={staff?.employee_id || 'Staff profile'}
      />

      {error && <Alert variant="danger" title="Data refresh failed" description={error} />}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <StaffDetailComponent
          staff={staff}
          onEdit={() => navigate(`/admin/staff/${id}/edit`)}
          onBack={() => navigate('/admin/staff')}
        />

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Supported actions</h2>
            <div className="mt-4 space-y-3">
              <Button fullWidth onClick={() => navigate(`/admin/staff/${id}/edit`)}>
                Edit profile
              </Button>
              <Button fullWidth variant="outline" onClick={() => setPerformanceOpen(true)}>
                Update performance
              </Button>
              <Button fullWidth variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete profile
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Supervisor</h2>
            <div className="mt-4 space-y-3">
              <Select
                label="Assign supervisor"
                value=""
                onChange={handleAssignSupervisor}
                options={supervisorOptions}
                placeholder="Select supervisor"
              />
              <p className="text-xs text-text-muted">
                Uses the backend `assign-supervisor` action. Choose a staff, admin, or loan officer user.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={performanceOpen}
        onClose={() => setPerformanceOpen(false)}
        title="Update Performance"
        description="Persist a staff rating using the backend performance endpoint."
        size="sm"
      >
        <form className="space-y-4" onSubmit={handleSavePerformance}>
          <Input
            label="Rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={performanceValues.rating}
            onChange={(event) =>
              setPerformanceValues((current) => ({ ...current, rating: event.target.value }))
            }
          />
          <Input
            label="Review date"
            type="date"
            value={performanceValues.review_date}
            onChange={(event) =>
              setPerformanceValues((current) => ({ ...current, review_date: event.target.value }))
            }
          />
          <Modal.Footer>
            <Button variant="outline" onClick={() => setPerformanceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={performanceSaving}>
              Save rating
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Staff Profile"
        description="This removes the operational staff profile while leaving the user account intact."
        size="sm"
      >
        <Modal.Footer>
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
            Delete profile
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default StaffDetail
