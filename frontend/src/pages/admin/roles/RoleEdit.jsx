import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Spin, Empty } from '@components/ui'
import { PageHeader } from '@components/shared'
import { RoleForm } from '@components/admin/roles'
import { useState, useEffect } from 'react'
import staffAPI from '@api/admin'
import { useToast } from '@contexts/ToastContext'

const RoleEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToast } = useToast()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRole()
  }, [id])

  const fetchRole = async () => {
    try {
      const response = await staffAPI.getRole(id)
      setRole(response.data || response)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load role',
      })
      navigate('/admin/roles')
    } finally {
      setLoading(false)
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
    return <Empty description="Role not found" />
  }

  return (
    <>
      <PageHeader
        title={`Edit Role - ${role.name}`}
        breadcrumb={['Admin', 'Roles', 'Edit']}
        onBack={() => navigate('/admin/roles')}
      />

      <Card className="shadow-soft">
        <RoleForm
          roleId={id}
          onSuccess={() => {
            navigate('/admin/roles')
          }}
          onCancel={() => navigate('/admin/roles')}
        />
      </Card>
    </>
  )
}

export default RoleEdit