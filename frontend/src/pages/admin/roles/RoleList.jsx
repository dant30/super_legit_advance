import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Modal } from '@components/ui'
import { PageHeader } from '@components/shared'
import { RoleList as RoleListComponent, PermissionEditor } from '@components/admin/roles'
import { Plus, Lock } from 'lucide-react'
import { useToast } from '@contexts/ToastContext'
import { useAuth } from '@hooks/useAuth'

const RoleList = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const [showPermissionEditor, setShowPermissionEditor] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  return (
    <>
      <PageHeader
        title="Role Management"
        breadcrumb={['Admin', 'Roles']}
        extra={
          hasPermission('can_manage_staff') && (
            <Button
              type="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/admin/roles/create')}
            >
              New Role
            </Button>
          )
        }
      />

      <RoleListComponent
        onEdit={(role) => navigate(`/admin/roles/${role.id}/edit`)}
        onDelete={() => {
          addToast({
            type: 'success',
            title: 'Success',
            message: 'Role deleted successfully',
          })
        }}
        onViewPermissions={(role) => {
          setSelectedRole(role)
          setShowPermissionEditor(true)
        }}
      />

      <Modal
        title={`Edit Permissions - ${selectedRole?.name}`}
        visible={showPermissionEditor}
        onCancel={() => {
          setShowPermissionEditor(false)
          setSelectedRole(null)
        }}
        footer={null}
        width={700}
      >
        {selectedRole && (
          <PermissionEditor
            roleId={selectedRole.id}
            onSave={() => {
              setShowPermissionEditor(false)
              setSelectedRole(null)
            }}
            onCancel={() => {
              setShowPermissionEditor(false)
              setSelectedRole(null)
            }}
          />
        )}
      </Modal>
    </>
  )
}

export default RoleList