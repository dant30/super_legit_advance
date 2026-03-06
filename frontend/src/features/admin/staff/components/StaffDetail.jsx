import React from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Tag from '@components/ui/Tag'
import { ArrowLeft, Edit } from 'lucide-react'
import { formatCurrency, formatDate } from '@utils/formatters'

const DetailRow = ({ label, value }) => (
  <div className="grid gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]">
    <div className="text-sm font-medium text-text-muted">{label}</div>
    <div className="min-w-0 text-sm text-text-primary">{value || 'Not set'}</div>
  </div>
)

const formatPermissions = (permissions) => {
  const items = Object.entries(permissions || {}).filter(([, enabled]) => Boolean(enabled))
  if (items.length === 0) {
    return 'No custom permissions'
  }

  return items.map(([key]) => key.replace(/_/g, ' ')).join(', ')
}

const StaffDetail = ({ staff, onEdit, onBack }) => {
  if (!staff) {
    return null
  }

  const user = staff.user_details || {}
  const supervisor = staff.supervisor_details || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" leadingIcon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          Back to staff
        </Button>
        <Button leadingIcon={<Edit className="h-4 w-4" />} onClick={() => onEdit?.(staff)}>
          Edit profile
        </Button>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{user.full_name || user.email}</h1>
            <p className="mt-1 text-sm text-text-muted">{staff.employee_id || 'No employee ID'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Tag color="info">{user.role_display || user.role || 'Unknown role'}</Tag>
              <Tag color={staff.is_available ? 'success' : 'warning'}>
                {staff.is_available ? 'Available' : 'Unavailable'}
              </Tag>
              {staff.can_approve_loans && <Tag color="success">Loan approver</Tag>}
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-text-muted">Approval tier</span>
              <div className="font-medium text-text-primary">{staff.approval_tier || 'Not set'}</div>
            </div>
            <div>
              <span className="text-text-muted">Max approval</span>
              <div className="font-medium text-text-primary">
                {staff.max_loan_approval_amount ? formatCurrency(staff.max_loan_approval_amount) : 'No limit set'}
              </div>
            </div>
            <div>
              <span className="text-text-muted">Performance</span>
              <div className="font-medium text-text-primary">
                {staff.performance_rating ? `${staff.performance_rating} / 5 (${staff.performance_level})` : 'Not rated'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Profile summary</h2>
        <div className="mt-4">
          <DetailRow label="Email" value={staff.work_email || user.email} />
          <DetailRow label="Phone" value={staff.work_phone || user.phone_number} />
          <DetailRow label="Department" value={staff.department} />
          <DetailRow label="Position" value={staff.position} />
          <DetailRow label="Hire date" value={staff.hire_date ? formatDate(staff.hire_date, 'MMM dd, yyyy') : 'Not set'} />
          <DetailRow label="Employment type" value={staff.employment_type?.replace(/_/g, ' ')} />
          <DetailRow label="Supervisor" value={supervisor.full_name || supervisor.email} />
          <DetailRow label="Office location" value={staff.office_location} />
          <DetailRow label="Availability note" value={staff.availability_note} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Access and controls</h2>
        <div className="mt-4">
          <DetailRow label="Loan approvals" value={staff.can_approve_loans ? 'Enabled' : 'Disabled'} />
          <DetailRow label="Customer management" value={staff.can_manage_customers ? 'Enabled' : 'Disabled'} />
          <DetailRow label="Payment processing" value={staff.can_process_payments ? 'Enabled' : 'Disabled'} />
          <DetailRow label="Report generation" value={staff.can_generate_reports ? 'Enabled' : 'Disabled'} />
          <DetailRow label="Custom permissions" value={formatPermissions(staff.permissions)} />
          <DetailRow label="Work schedule" value={staff.work_schedule_display} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Emergency and banking</h2>
        <div className="mt-4">
          <DetailRow label="Emergency contact" value={staff.emergency_contact_name} />
          <DetailRow label="Emergency phone" value={staff.emergency_contact_phone} />
          <DetailRow label="Relationship" value={staff.emergency_contact_relationship} />
          <DetailRow label="Bank" value={staff.bank_name} />
          <DetailRow label="Account" value={staff.bank_account_masked} />
          <DetailRow label="Branch" value={staff.bank_branch} />
          <DetailRow label="Notes" value={staff.notes} />
        </div>
      </Card>
    </div>
  )
}

export default StaffDetail
