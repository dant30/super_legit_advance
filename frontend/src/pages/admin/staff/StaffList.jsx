import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Card,
  Space,
  Row,
  Col,
  Statistic,
  Modal,
  Spin,
} from '@components/ui'
import { PageHeader } from '@components/shared'
import {
  StaffTable,
  StaffFilters,
} from '@components/admin/staff'
import { Plus, Download, Upload, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import { useAuth } from '@hooks/useAuth'
import staffAPI from '@api/admin'

const StaffList = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { hasPermission } = useAuth()

  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  })
  const [stats, setStats] = useState({
    total_staff: 0,
    active_staff: 0,
    inactive_staff: 0,
  })

  const fetchStaff = useCallback(async (page = 1, filtersObj = {}) => {
    setLoading(true)
    try {
      const response = await staffAPI.getStaff({
        page,
        page_size: 20,
        ...filtersObj,
      })
      setStaff(response.results || [])
      setPagination({
        page: response.page || page,
        page_size: response.page_size || 20,
        total: response.count || 0,
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to fetch staff',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const fetchStats = useCallback(async () => {
    try {
      const response = await staffAPI.getStaffStats()
      setStats(response)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchStaff(1, filters)
    fetchStats()
  }, [filters, fetchStaff, fetchStats])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    fetchStaff(1, newFilters)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Staff Member?',
      content: `Are you sure you want to delete ${record.full_name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await staffAPI.deleteStaff(record.id)
          addToast({
            type: 'success',
            title: 'Success',
            message: 'Staff member deleted successfully',
          })
          fetchStaff(pagination.page, filters)
        } catch (error) {
          addToast({
            type: 'error',
            title: 'Error',
            message: error?.message || 'Failed to delete staff',
          })
        }
      },
    })
  }

  const handleExport = async () => {
    try {
      await staffAPI.exportStaff('excel', filters)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff list exported successfully',
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to export staff',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subTitle="Manage team members and their assignments"
        extra={
          <Space>
            <Button
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => fetchStaff(pagination.page, filters)}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              icon={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              Export
            </Button>
            {hasPermission('can_manage_staff') && (
              <Button
                type="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => navigate('/admin/staff/create')}
              >
                Add Staff
              </Button>
            )}
          </Space>
        }
      />

      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card className="shadow-soft">
            <Statistic
              title="Total Staff"
              value={stats.total_staff}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-soft">
            <Statistic
              title="Active"
              value={stats.active_staff}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-soft">
            <Statistic
              title="Inactive"
              value={stats.inactive_staff}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <StaffFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Staff Table */}
      <StaffTable
        staff={staff}
        loading={loading}
        pagination={pagination}
        onEdit={(record) => navigate(`/admin/staff/${record.id}/edit`)}
        onView={(record) => navigate(`/admin/staff/${record.id}`)}
        onDelete={handleDelete}
        onPageChange={(page) => fetchStaff(page, filters)}
      />
    </div>
  )
}

export default StaffList