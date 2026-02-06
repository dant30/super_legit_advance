import React, { useState, useEffect } from 'react'
import {
  Card,
  Checkbox,
  Button,
  Space,
  Spin,
  Alert,
  Tag,
  //Tree,
} from '@components/ui'
import { EmptyState } from '@components/shared'
import { useToast } from '@contexts/ToastContext'
import staffAPI from '@api/admin'
import { Lock, Save, RefreshCw } from 'lucide-react'

const PermissionEditor = ({ roleId, onSave, onCancel }) => {
  const [role, setRole] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    if (roleId) {
      fetchData()
    }
  }, [roleId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [roleRes, permRes] = await Promise.all([
        staffAPI.getRole(roleId),
        staffAPI.getPermissions(),
      ])

      const roleData = roleRes.data || roleRes
      const permData = permRes.data || permRes

      setRole(roleData)
      setPermissions(permData || [])
      setSelectedPermissions(roleData.permissions || [])
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load role and permissions',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPermissions(permissions.map((p) => p.id))
    } else {
      setSelectedPermissions([])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await staffAPI.updateRolePermissions(roleId, {
        permissions: selectedPermissions,
      })
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Permissions updated successfully',
      })
      if (onSave) onSave()
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update permissions'
      addToast({ type: 'error', title: 'Error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    )
  }

  if (!role) {
    return <EmptyState description="Role not found" />
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary-600" />
              {role.name} Permissions
            </h3>
            <p className="text-sm text-gray-500">{role.description}</p>
          </div>
          <Tag color="blue">{selectedPermissions.length} selected</Tag>
        </div>
      </Card>

      <Alert
        message="Manage which permissions this role has access to"
        type="info"
        showIcon
        className="mb-4"
      />

      <Card title="Permissions" className="shadow-soft">
        {permissions.length === 0 ? (
          <EmptyState description="No permissions available" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Checkbox
                checked={
                  selectedPermissions.length === permissions.length &&
                  permissions.length > 0
                }
                indeterminate={
                  selectedPermissions.length > 0 &&
                  selectedPermissions.length < permissions.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                <span className="font-medium">Select All Permissions</span>
              </Checkbox>
            </div>

            <div className="space-y-3">
              {permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 transition"
                >
                  <Checkbox
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{perm.name}</div>
                    <div className="text-sm text-gray-500">{perm.description}</div>
                    {perm.category && (
                      <Tag className="mt-2">{perm.category}</Tag>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Space>
        <Button
          type="primary"
          icon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          loading={saving}
        >
          Save Permissions
        </Button>
        <Button
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchData}
          loading={loading}
        >
          Refresh
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </div>
  )
}

export default PermissionEditor