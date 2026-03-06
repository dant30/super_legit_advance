import React from 'react'
import Button from '@components/ui/Button'
import Dropdown from '@components/ui/Dropdown'
import Table from '@components/ui/Table'
import Tag from '@components/ui/Tag'
import { Edit, Eye, MoreVertical, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@utils/formatters'

const availabilityTag = (isAvailable) => (
  <Tag color={isAvailable ? 'success' : 'warning'}>
    {isAvailable ? 'Available' : 'Unavailable'}
  </Tag>
)

const approvalTierLabel = (tier) => {
  if (!tier) return 'Not set'
  return tier
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const StaffTable = ({
  staff = [],
  loading = false,
  pagination = {},
  onEdit,
  onView,
  onDelete,
  onPageChange,
}) => {
  const columns = [
    {
      title: 'Staff member',
      key: 'staff_member',
      render: (_value, record) => {
        const user = record.user_details || {}
        return (
          <div className="min-w-0">
            <div className="truncate font-medium text-text-primary">
              {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown staff'}
            </div>
            <div className="truncate text-xs text-text-muted">{record.employee_id || 'No employee ID'}</div>
          </div>
        )
      },
    },
    {
      title: 'Role',
      key: 'role',
      render: (_value, record) => {
        const user = record.user_details || {}
        return <Tag color="info">{user.role_display || user.role || 'Unknown role'}</Tag>
      },
    },
    {
      title: 'Department / Position',
      key: 'department_position',
      render: (_value, record) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-text-primary">{record.department || 'Unassigned'}</div>
          <div className="truncate text-xs text-text-muted">{record.position || 'No position set'}</div>
        </div>
      ),
    },
    {
      title: 'Work contact',
      key: 'contact',
      render: (_value, record) => {
        const user = record.user_details || {}
        return (
          <div className="min-w-0 text-sm">
            <div className="truncate">{record.work_phone || user.phone_number || 'No phone'}</div>
            <div className="truncate text-xs text-text-muted">{record.work_email || user.email || 'No email'}</div>
          </div>
        )
      },
    },
    {
      title: 'Availability',
      key: 'availability',
      render: (_value, record) => availabilityTag(record.is_available),
    },
    {
      title: 'Approval',
      key: 'approval',
      render: (_value, record) => (
        <div className="min-w-0 text-sm">
          <div className="truncate font-medium text-text-primary">{approvalTierLabel(record.approval_tier)}</div>
          <div className="truncate text-xs text-text-muted">
            {record.max_loan_approval_amount ? formatCurrency(record.max_loan_approval_amount) : 'No approval limit'}
          </div>
        </div>
      ),
    },
    {
      title: 'Hired',
      dataIndex: 'hire_date',
      key: 'hire_date',
      render: (value) => (value ? formatDate(value, 'MMM dd, yyyy') : 'Not set'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_value, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View details',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onView?.(record),
              },
              {
                key: 'edit',
                label: 'Edit profile',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => onEdit?.(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Delete profile',
                icon: <Trash2 className="h-4 w-4" />,
                danger: true,
                onClick: () => onDelete?.(record),
              },
            ],
          }}
        >
          <Button variant="ghost" size="icon" icon={<MoreVertical className="h-4 w-4" />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={staff}
      loading={loading}
      rowKey="id"
      pagination={{
        current: pagination.page || 1,
        pageSize: pagination.page_size || 20,
        total: pagination.total || 0,
        onChange: onPageChange,
        showSizeChanger: false,
        showTotal: (total) => `Total ${total} staff profiles`,
      }}
      scroll={{ x: 960 }}
      className="rounded-xl"
    />
  )
}

export default StaffTable
