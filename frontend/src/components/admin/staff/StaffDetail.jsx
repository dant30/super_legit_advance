import React, { useState } from 'react'
import {
  Card,
  Button,
  Descriptions,
  Tabs,
  Badge,
  Alert,
  Statistic,
  Row,
  Col,
  Tag,
  Space,
  Modal,
  Timeline,
} from '@components/ui'
import {
  Edit,
  Mail,
  Phone,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  Lock,
  Download,
  ArrowLeft,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@utils/formatters'
import { cn } from '@utils/cn'

const StaffDetail = ({
  staff,
  loading = false,
  onEdit,
  onBack,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState('profile')

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

  if (!staff) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No staff data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          type="text"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Back
        </Button>
        <Space>
          <Button
            type="primary"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => onEdit?.(staff)}
          >
            Edit
          </Button>
        </Space>
      </div>

      {/* Profile Overview */}
      <Card className="shadow-soft">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {staff.first_name?.charAt(0)}
                {staff.last_name?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{staff.full_name}</h1>
              <p className="text-gray-600">{staff.employee_id}</p>
              <div className="flex items-center gap-2 mt-2">
                <Tag color={statusColors[staff.status]}>
                  {staff.status?.replace(/_/g, ' ')}
                </Tag>
                <Tag color={roleColors[staff.role]}>
                  {staff.role}
                </Tag>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">
              {formatCurrency(staff.approval_limit || 0)}
            </div>
            <p className="text-gray-500 text-sm">Approval Limit</p>
          </div>
        </div>
      </Card>

      {/* Status Alert */}
      {staff.status !== 'ACTIVE' && (
        <Alert
          message={`Staff is currently ${staff.status?.replace(/_/g, ' ').toLowerCase()}`}
          type={staff.status === 'TERMINATED' ? 'error' : 'warning'}
          showIcon
          icon={
            staff.status === 'TERMINATED' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )
          }
        />
      )}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            label: 'Profile Information',
            key: 'profile',
            children: (
              <Card className="shadow-soft">
                <Descriptions
                  column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                  bordered
                >
                  <Descriptions.Item label="Full Name">
                    {staff.full_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Employee ID">
                    {staff.employee_id}
                  </Descriptions.Item>

                  <Descriptions.Item label="Email">
                    <a href={`mailto:${staff.email}`} className="text-primary-600 hover:underline">
                      {staff.email}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    <a href={`tel:${staff.phone}`} className="text-primary-600 hover:underline">
                      {staff.phone}
                    </a>
                  </Descriptions.Item>

                  <Descriptions.Item label="Date of Birth">
                    {formatDate(staff.date_of_birth, 'MMM dd, yyyy')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    {staff.age || 'N/A'} years
                  </Descriptions.Item>

                  <Descriptions.Item label="Department">
                    {staff.department}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    <Tag color={roleColors[staff.role]}>{staff.role}</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Date Joined">
                    {formatDate(staff.date_joined, 'MMM dd, yyyy')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={statusColors[staff.status]}>
                      {staff.status?.replace(/_/g, ' ')}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            label: 'Work Information',
            key: 'work',
            children: (
              <Card className="shadow-soft">
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Approval Limit"
                      value={staff.approval_limit || 0}
                      prefix="KES "
                      valueStyle={{ color: '#3b82f6' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Loans Processed"
                      value={staff.loans_processed || 0}
                      valueStyle={{ color: '#10b981' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Collections"
                      value={formatCurrency(staff.collections_amount || 0)}
                      valueStyle={{ color: '#f59e0b' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Active Cases"
                      value={staff.active_cases || 0}
                      valueStyle={{ color: '#ef4444' }}
                    />
                  </Col>
                </Row>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'can_approve_loans',
                      'can_disburse_loans',
                      'can_view_reports',
                      'can_manage_customers',
                      'can_manage_repayments',
                      'can_manage_staff',
                    ].map((perm) => (
                      <div
                        key={perm}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded',
                          staff.permissions?.includes(perm)
                            ? 'bg-success-50 text-success-700'
                            : 'bg-gray-50 text-gray-500'
                        )}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">{perm.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ),
          },
          {
            label: 'Activity & History',
            key: 'activity',
            children: (
              <Card className="shadow-soft">
                <Timeline items={staff.activity_log || []} />
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}

export default StaffDetail