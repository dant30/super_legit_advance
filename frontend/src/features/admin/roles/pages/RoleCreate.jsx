import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@components/ui'
import { PageHeader } from '@components/ui'
import { RoleForm } from '@components/admin/roles'

const RoleCreate = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Create New Role"
        breadcrumb={['Admin', 'Roles', 'Create']}
        onBack={() => navigate('/admin/roles')}
      />

      <Card className="shadow-soft">
        <RoleForm
          onSuccess={() => {
            navigate('/admin/roles')
          }}
          onCancel={() => navigate('/admin/roles')}
        />
      </Card>
    </>
  )
}

export default RoleCreate

