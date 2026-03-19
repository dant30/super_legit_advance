import React, { useState, useEffect, useCallback } from 'react'
import Button from '@components/ui/Button'
import Space from '@components/ui/Space'
import PageHeader from '@components/ui/PageHeader'
import {
  StaffTable,
  StaffFilters,
} from '@components/admin/staff'
import { Plus, RefreshCw, Users, UserCheck, UserMinus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@contexts/ToastContext'
import { useAuth } from '@features/auth/hooks/useAuth'
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
      setStaff(response.items || [])
      setPagination({
        page: response.pagination?.current_page || page,
        page_size: response.pagination?.per_page || 20,
        total: response.pagination?.total || 0,
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
  }

  const handleDelete = (record) => {
    const displayName = record?.user_details?.full_name || record?.user_details?.email || record?.employee_id || 'this staff profile'
    if (!window.confirm(`Delete ${displayName}? This action cannot be undone.`)) {
      return
    }

    ;(async () => {
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
    })()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subTitle="Manage staff profiles, reporting lines, and approval controls"
        extra={
          <Space wrap>
            <Button
              className="w-full sm:w-auto"
              leadingIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => fetchStaff(pagination.page, filters)}
              loading={loading}
            >
              Refresh
            </Button>
            {hasPermission('can_manage_staff') && (
              <Button
                className="w-full sm:w-auto"
                variant="primary"
                leadingIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate('/admin/staff/create')}
              >
                Create profile
              </Button>
            )}
          </Space>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            key: 'total',
            title: 'Total Staff',
            value: Number(stats.total_staff || 0).toLocaleString(),
            helper: 'All team members in organization',
            icon: Users,
            valueClass: 'text-brand-700',
          },
          {
            key: 'active',
            title: 'Active',
            value: Number(stats.active_staff || 0).toLocaleString(),
            helper: 'Currently available staff members',
            icon: UserCheck,
            valueClass: 'text-feedback-success',
          },
          {
            key: 'inactive',
            title: 'Inactive',
            value: Number(stats.inactive_staff || 0).toLocaleString(),
            helper: 'On leave or inactive assignments',
            icon: UserMinus,
            valueClass: 'text-feedback-warning',
          },
        ].map((item, index) => (
          <article
            key={item.key}
            className="rounded-xl border bg-surface-panel p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium animate-fade-in"
            style={{
              borderColor: 'var(--surface-border)',
              animationDelay: `${index * 35}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{item.title}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
                <item.icon className="h-4 w-4" />
              </span>
            </div>
            <p className={`mt-3 text-2xl font-semibold leading-none ${item.valueClass}`}>{item.value}</p>
            <p className="mt-2 text-xs text-text-muted">{item.helper}</p>
          </article>
        ))}
      </div>

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

