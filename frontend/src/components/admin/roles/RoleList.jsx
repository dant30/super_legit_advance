import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Spin,
  Badge,
} from '@components/ui'
import { EmptyState } from '@components/shared'
import {
  Edit,
  Plus,
  Trash2,
  Shield,
  Users,
  Lock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useToast } from '@contexts/ToastContext'
import { useAuth } from '@hooks/useAuth'
import staffAPI from '@api/admin'
import { formatDate } from '@utils/formatters'
import { cn } from '@utils/cn'

const RoleList = ({ onEdit, onDelete, onViewPermissions }) => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const { addToast } = useToast()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await staffAPI.getRoles()
      setRoles(response.data || response || [])
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to fetch roles'
      addToast({ type: 'error', title: 'Error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (role) => {
    Modal.confirm({
      title: 'Delete Role',
      content: `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await staffAPI.deleteRole(role.id)
          addToast({
            type: 'success',
            title: 'Success',
            message: 'Role deleted successfully',
          })
          fetchRoles()
          if (onDelete) onDelete(role)
        } catch (error) {
          const msg = error?.response?.data?.message || 'Failed to delete role'
          addToast({ type: 'error', title: 'Error', message: msg })
        }
      },
    })
  }

  const columns = [
    {
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary-600" />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (text) => <span className="text-sm text-gray-600">{text || '-'}</span>,
    },
    {
      title: 'Users',
      dataIndex: 'user_count',
      key: 'user_count',
      width: 80,
      align: 'center',
      render: (count) => (
        <Badge
          count={count || 0}
          style={{ backgroundColor: '#3b82f6' }}
          icon={<Users className="h-3 w-3" />}
        />
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permission_count',
      key: 'permission_count',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="text-sm font-medium">{count || 0}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active) => (
        <Tag
          color={active ? 'success' : 'default'}
          icon={active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        >
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => <span className="text-xs text-gray-500">{formatDate(date)}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Lock className="h-4 w-4" />}
            onClick={() => {
              setSelectedRole(record)
              if (onViewPermissions) onViewPermissions(record)
            }}
            title="View Permissions"
          />
          {hasPermission('can_manage_staff') && (
            <>
              <Button
                type="text"
                size="small"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => {
                  setSelectedRole(record)
                  if (onEdit) onEdit(record)
                }}
              />
              <Button
                type="text"
                danger
                size="small"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => handleDelete(record)}
              />
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Card className="shadow-soft">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : roles.length === 0 ? (
        <EmptyState description="No roles found" />
      ) : (
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      )}
    </Card>
  )
}

export default RoleList