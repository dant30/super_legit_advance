import React, { useState, useEffect } from 'react'
import { Spin, Card, Tabs } from '@components/ui'
import { PageHeader } from '@components/shared'
import {
  StaffDetail as StaffDetailComponent,
  TaskAssignment,
  WorkSchedule,
  StaffPerformance,
} from '@components/admin/staff'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import staffAPI from '@api/admin'

const StaffDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [schedule, setSchedule] = useState([])
  const [performance, setPerformance] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [staffData, tasksData, scheduleData, perfData] = await Promise.all([
          staffAPI.getStaff(id),
          staffAPI.getStaffTasks(id),
          staffAPI.getStaffSchedule(id),
          staffAPI.getStaffPerformance(id),
        ])
        setStaff(staffData)
        setTasks(tasksData.results || [])
        setSchedule(scheduleData.results || [])
        setPerformance(perfData)
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error?.message || 'Failed to fetch staff details',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, addToast])

  if (loading) return <Spin />

  return (
    <div className="space-y-6">
      <PageHeader
        title={staff?.full_name || 'Staff Details'}
        subTitle={staff?.employee_id}
      />

      <Tabs
        items={[
          {
            label: 'Profile',
            key: 'profile',
            children: (
              <StaffDetailComponent
                staff={staff}
                onEdit={() => navigate(`/admin/staff/${id}/edit`)}
                onBack={() => navigate('/admin/staff')}
              />
            ),
          },
          {
            label: 'Performance',
            key: 'performance',
            children: (
              <StaffPerformance
                staff={staff}
                performanceData={performance}
              />
            ),
          },
          {
            label: 'Tasks',
            key: 'tasks',
            children: (
              <TaskAssignment
                staffId={id}
                tasks={tasks}
                onAddTask={async (data) => {
                  await staffAPI.createStaffTask(data)
                  const updated = await staffAPI.getStaffTasks(id)
                  setTasks(updated.results || [])
                }}
                onDeleteTask={async (taskId) => {
                  await staffAPI.deleteStaffTask(taskId)
                  const updated = await staffAPI.getStaffTasks(id)
                  setTasks(updated.results || [])
                }}
              />
            ),
          },
          {
            label: 'Schedule',
            key: 'schedule',
            children: (
              <WorkSchedule
                staffId={id}
                schedule={schedule}
                onAddShift={async (data) => {
                  await staffAPI.createStaffShift(data)
                  const updated = await staffAPI.getStaffSchedule(id)
                  setSchedule(updated.results || [])
                }}
                onDeleteShift={async (shiftId) => {
                  await staffAPI.deleteStaffShift(shiftId)
                  const updated = await staffAPI.getStaffSchedule(id)
                  setSchedule(updated.results || [])
                }}
              />
            ),
          },
        ]}
      />
    </div>
  )
}

export default StaffDetail