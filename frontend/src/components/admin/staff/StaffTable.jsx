import React, { useState, useMemo } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Dropdown,
  Badge,
  Tooltip,
  Modal,
} from '@components/ui'
import { Avatar } from '@components/shared'
import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@utils/formatters'
import { cn } from '@utils/cn'

const StaffTable = ({
  staff = [],
  loading = false,
  pagination = {},
  onEdit,
  onView,
  onDelete,
  onPageChange,
  onFiltersChange,
  filters = {},
}) => {
  const [selectedStaff, setSelectedStaff] = useState(null)

  const statusColors = {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    ON_LEAVE: 'default',
    TERMINATED: 'danger',
  }

  const roleColors = {
    ADMIN: 'purple',
    MANAGER: 'blue',
    OFFICER: 'cyan',
    STAFF: 'green',
  }

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={record.full_name}
            src={record.profile_image}
            size="md"
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm">{record.full_name}</span>
            <span className="text-xs text-gray-500">{record.employee_id}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={roleColors[role] || 'default'}>{role}</Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 130,
      render: (dept) => <span className="text-sm">{dept || 'N/A'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={statusColors[status]}>
          {status.replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone, record) => (
        <div className="flex flex-col gap-1">
          <Tooltip title="Call">
            <a href={`tel:${phone}`} className="flex items-center gap-1 text-xs hover:text-primary-600">
              <Phone className="h-3 w-3" />
              {phone}
            </a>
          </Tooltip>
          <Tooltip title="Email">
            <a href={`mailto:${record.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600">
              <Mail className="h-3 w-3" />
              {record.email}
            </a>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'date_joined',
      key: 'date_joined',
      width: 110,
      render: (date) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3 text-gray-400" />
          {formatDate(date, 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      title: 'Approval Limit',
      dataIndex: 'approval_limit',
      key: 'approval_limit',
      width: 130,
      render: (limit) => (
        <span className="font-medium">{formatCurrency(limit)}</span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (id, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Details',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onView?.(record),
              },
              {
                key: 'edit',
                label: 'Edit',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => onEdit?.(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                danger: true,
                onClick: () => onDelete?.(record),
              },
            ],
          }}
        >
          <Button
            type="text"
            size="sm"
            icon={<MoreVertical className="h-4 w-4" />}
          />
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="space-y-4">
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
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} staff members`,
        }}
        scroll={{ x: 1200 }}
        className="shadow-soft rounded-lg"
      />
    </div>
  )
}

export default StaffTable