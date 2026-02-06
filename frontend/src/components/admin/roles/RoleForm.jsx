import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Switch,
  Checkbox,
  Alert,
} from '@components/ui'
import { useToast } from '@contexts/ToastContext'
import staffAPI from '@api/admin'
import { AlertCircle } from 'lucide-react'

const ROLE_TEMPLATES = {
  ADMIN: {
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['all'],
  },
  MANAGER: {
    name: 'Manager',
    description: 'Department management',
    permissions: ['manage_staff', 'view_reports', 'approve_loans'],
  },
  OFFICER: {
    name: 'Loan Officer',
    description: 'Loan processing',
    permissions: ['create_loans', 'view_customers', 'manage_applications'],
  },
  STAFF: {
    name: 'Staff',
    description: 'Basic operations',
    permissions: ['view_customers', 'view_loans'],
  },
}

const RoleForm = ({ roleId, onSuccess, onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [allPermissions, setAllPermissions] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const { addToast } = useToast()

  useEffect(() => {
    fetchPermissions()
    if (roleId) {
      fetchRole()
    }
  }, [roleId])

  const fetchPermissions = async () => {
    try {
      const response = await staffAPI.getPermissions()
      setAllPermissions(response.data || response || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const fetchRole = async () => {
    try {
      const response = await staffAPI.getRole(roleId)
      const roleData = response.data || response
      form.setFieldsValue({
        name: roleData.name,
        code: roleData.code,
        description: roleData.description,
        is_active: roleData.is_active,
        permissions: roleData.permissions || [],
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch role details',
      })
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const payload = {
        name: values.name,
        code: values.code?.toUpperCase(),
        description: values.description,
        is_active: values.is_active,
        permissions: values.permissions || [],
      }

      if (roleId) {
        await staffAPI.updateRole(roleId, payload)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Role updated successfully',
        })
      } else {
        await staffAPI.createRole(payload)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Role created successfully',
        })
      }

      if (onSuccess) onSuccess()
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to save role'
      addToast({ type: 'error', title: 'Error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (templateKey) => {
    const template = ROLE_TEMPLATES[templateKey]
    form.setFieldsValue({
      name: template.name,
      code: templateKey,
      description: template.description,
      permissions: template.permissions,
    })
    setSelectedTemplate(templateKey)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-4"
    >
      <Card title="Role Templates" className="shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
            <Button
              key={key}
              onClick={() => applyTemplate(key)}
              variant={selectedTemplate === key ? 'primary' : 'default'}
              className="h-auto p-3 text-left"
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-xs opacity-75">{template.description}</div>
            </Button>
          ))}
        </div>
      </Card>

      <Card title="Basic Information" className="shadow-soft">
        <Form.Item
          name="name"
          label="Role Name"
          rules={[
            { required: true, message: 'Role name is required' },
            { min: 3, message: 'Role name must be at least 3 characters' },
          ]}
        >
          <Input placeholder="e.g., Manager, Officer" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Role Code"
          rules={[
            { required: true, message: 'Role code is required' },
            { pattern: /^[A-Z_]+$/, message: 'Code must be uppercase letters and underscores' },
          ]}
        >
          <Input placeholder="e.g., MANAGER, LOAN_OFFICER" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Describe the role's purpose and responsibilities"
          />
        </Form.Item>

        <Form.Item
          name="is_active"
          label="Active"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="Permissions" className="shadow-soft">
        <Alert
          message="Assign permissions to this role"
          type="info"
          showIcon
          icon={<AlertCircle className="h-4 w-4" />}
          className="mb-4"
        />

        <Form.Item name="permissions">
          <Checkbox.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allPermissions.map((perm) => (
                <Checkbox key={perm.id} value={perm.id}>
                  <span className="font-medium">{perm.name}</span>
                  <p className="text-xs text-gray-500">{perm.description}</p>
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          {roleId ? 'Update Role' : 'Create Role'}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </Form>
  )
}

export default RoleForm