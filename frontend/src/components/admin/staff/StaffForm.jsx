import React, { useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  Card,
  Row,
  Col,
  Alert,
} from '@components/ui'
import { DatePicker } from '@components/shared'
import { useToast } from '@contexts/ToastContext'
import dayjs from 'dayjs'

const ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'OFFICER', label: 'Loan Officer' },
  { value: 'STAFF', label: 'Service Staff' },
]

const DEPARTMENTS = [
  { value: 'LOANS', label: 'Loans Department' },
  { value: 'COLLECTIONS', label: 'Collections' },
  { value: 'DISBURSEMENTS', label: 'Disbursements' },
  { value: 'ADMIN', label: 'Administration' },
  { value: 'IT', label: 'IT/Technical' },
]

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'TERMINATED', label: 'Terminated' },
]

const StaffForm = ({ initialData = null, onSubmit, loading = false }) => {
  const [form] = Form.useForm()
  const { addToast } = useToast()

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        date_joined: initialData.date_joined ? dayjs(initialData.date_joined) : null,
        date_of_birth: initialData.date_of_birth ? dayjs(initialData.date_of_birth) : null,
      })
    }
  }, [initialData, form])

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        date_joined: values.date_joined?.format('YYYY-MM-DD'),
        date_of_birth: values.date_of_birth?.format('YYYY-MM-DD'),
      }
      await onSubmit?.(payload)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to submit form',
      })
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-6"
    >
      {/* Personal Information */}
      <Card title="Personal Information" className="shadow-soft">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[
                { required: true, message: 'First name is required' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[
                { required: true, message: 'Last name is required' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input type="email" placeholder="staff@example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: 'Phone is required' },
                { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Invalid phone format' },
              ]}
            >
              <Input placeholder="+254712345678" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Date of Birth"
              name="date_of_birth"
              rules={[{ required: true, message: 'Date of birth is required' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Employee ID"
              name="employee_id"
              rules={[{ required: true, message: 'Employee ID is required' }]}
            >
              <Input placeholder="EMP-001" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Employment Information */}
      <Card title="Employment Information" className="shadow-soft">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Role is required' }]}
            >
              <Select placeholder="Select role" options={ROLES} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: 'Department is required' }]}
            >
              <Select placeholder="Select department" options={DEPARTMENTS} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Date Joined"
              name="date_joined"
              rules={[{ required: true, message: 'Date joined is required' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select placeholder="Select status" options={STATUSES} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Approval Limit (KES)"
              name="approval_limit"
              rules={[
                { required: true, message: 'Approval limit is required' },
                { type: 'number', min: 0, message: 'Must be a positive number' },
              ]}
            >
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
              />

            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Supervisor"
              name="supervisor"
            >
              <Input placeholder="Supervisor name" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Permissions & Access */}
      <Card title="Permissions & Access" className="shadow-soft">
        <Alert
          message="Manage staff access and permissions"
          type="info"
          showIcon
          className="mb-4"
        />

        <Form.Item name="permissions" valuePropName="value">
          <Checkbox.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox value="can_approve_loans">
                Can Approve Loans
              </Checkbox>
              <Checkbox value="can_disburse_loans">
                Can Disburse Loans
              </Checkbox>
              <Checkbox value="can_view_reports">
                Can View Reports
              </Checkbox>
              <Checkbox value="can_manage_customers">
                Can Manage Customers
              </Checkbox>
              <Checkbox value="can_manage_repayments">
                Can Manage Repayments
              </Checkbox>
              <Checkbox value="can_manage_staff">
                Can Manage Staff
              </Checkbox>
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="default" onClick={() => form.resetFields()}>
          Reset
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="lg"
        >
          {initialData ? 'Update Staff' : 'Create Staff'}
        </Button>
      </div>
    </Form>
  )
}

export default StaffForm