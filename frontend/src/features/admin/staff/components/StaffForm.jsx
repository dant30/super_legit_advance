import React, { useEffect, useMemo, useState } from 'react'
import Alert from '@components/ui/Alert'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Checkbox from '@components/ui/Checkbox'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
]

const APPROVAL_TIERS = [
  { value: 'junior', label: 'Junior officer' },
  { value: 'senior', label: 'Senior officer' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
]

const emptyFormState = {
  user_id: '',
  employee_id: '',
  department: '',
  position: '',
  hire_date: '',
  employment_type: 'full_time',
  supervisor: '',
  office_location: '',
  work_phone: '',
  work_email: '',
  approval_tier: 'junior',
  can_approve_loans: false,
  can_manage_customers: true,
  can_process_payments: true,
  can_generate_reports: true,
  max_loan_approval_amount: '',
  is_available: true,
  availability_note: '',
  bank_name: '',
  bank_account_number: '',
  bank_branch: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  notes: '',
  permissions_json: '{}',
  work_schedule_json: '{}',
}

const buildInitialState = (initialData) => {
  if (!initialData) {
    return emptyFormState
  }

  return {
    ...emptyFormState,
    user_id: initialData.user || '',
    employee_id: initialData.employee_id || '',
    department: initialData.department || '',
    position: initialData.position || '',
    hire_date: initialData.hire_date || '',
    employment_type: initialData.employment_type || 'full_time',
    supervisor: initialData.supervisor || '',
    office_location: initialData.office_location || '',
    work_phone: initialData.work_phone || '',
    work_email: initialData.work_email || '',
    approval_tier: initialData.approval_tier || 'junior',
    can_approve_loans: Boolean(initialData.can_approve_loans),
    can_manage_customers: initialData.can_manage_customers ?? true,
    can_process_payments: initialData.can_process_payments ?? true,
    can_generate_reports: initialData.can_generate_reports ?? true,
    max_loan_approval_amount: initialData.max_loan_approval_amount || '',
    is_available: initialData.is_available ?? true,
    availability_note: initialData.availability_note || '',
    bank_name: initialData.bank_name || '',
    bank_account_number: '',
    bank_branch: initialData.bank_branch || '',
    emergency_contact_name: initialData.emergency_contact_name || '',
    emergency_contact_phone: initialData.emergency_contact_phone || '',
    emergency_contact_relationship: initialData.emergency_contact_relationship || '',
    notes: initialData.notes || '',
    permissions_json: JSON.stringify(initialData.permissions || {}, null, 2),
    work_schedule_json: JSON.stringify(initialData.work_schedule || {}, null, 2),
  }
}

const normalizeJsonField = (value, fieldName) => {
  const trimmed = (value || '').trim()
  if (!trimmed) {
    return {}
  }

  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }

    throw new Error('must be an object')
  } catch {
    throw new Error(`${fieldName} must be valid JSON object`)
  }
}

const buildPayload = (formState, isEditMode) => {
  const payload = {
    department: formState.department.trim(),
    position: formState.position.trim(),
    employment_type: formState.employment_type,
    supervisor: formState.supervisor || null,
    office_location: formState.office_location.trim(),
    work_phone: formState.work_phone.trim(),
    work_email: formState.work_email.trim(),
    approval_tier: formState.approval_tier,
    permissions: normalizeJsonField(formState.permissions_json, 'Permissions'),
    work_schedule: normalizeJsonField(formState.work_schedule_json, 'Work schedule'),
    is_available: Boolean(formState.is_available),
    availability_note: formState.availability_note.trim(),
    bank_name: formState.bank_name.trim(),
    bank_account_number: formState.bank_account_number.trim(),
    bank_branch: formState.bank_branch.trim(),
    emergency_contact_name: formState.emergency_contact_name.trim(),
    emergency_contact_phone: formState.emergency_contact_phone.trim(),
    emergency_contact_relationship: formState.emergency_contact_relationship.trim(),
    notes: formState.notes.trim(),
    can_approve_loans: Boolean(formState.can_approve_loans),
    can_manage_customers: Boolean(formState.can_manage_customers),
    can_process_payments: Boolean(formState.can_process_payments),
    can_generate_reports: Boolean(formState.can_generate_reports),
    max_loan_approval_amount: formState.max_loan_approval_amount || null,
  }

  if (!isEditMode) {
    payload.user_id = formState.user_id
    payload.employee_id = formState.employee_id.trim()
    payload.hire_date = formState.hire_date || null
  }

  return payload
}

const toUserOption = (user) => ({
  value: user.id,
  label: `${user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email} (${user.role_display || user.role})`,
})

const StaffForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  eligibleUsers = [],
  supervisorUsers = [],
  submitError = '',
}) => {
  const isEditMode = Boolean(initialData?.id)
  const [formState, setFormState] = useState(() => buildInitialState(initialData))
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    setFormState(buildInitialState(initialData))
    setValidationError('')
  }, [initialData])

  const eligibleUserOptions = useMemo(
    () => eligibleUsers.map(toUserOption),
    [eligibleUsers]
  )

  const supervisorOptions = useMemo(
    () => supervisorUsers.map(toUserOption),
    [supervisorUsers]
  )

  const handleChange = (field) => (eventOrValue) => {
    const nextValue =
      eventOrValue?.target?.type === 'checkbox'
        ? eventOrValue.target.checked
        : eventOrValue?.target?.value ?? eventOrValue

    setFormState((current) => ({
      ...current,
      [field]: nextValue,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setValidationError('')

    if (!isEditMode && !formState.user_id) {
      setValidationError('Select a staff user to create a profile for.')
      return
    }

    if (!isEditMode && !formState.employee_id.trim()) {
      setValidationError('Employee ID is required.')
      return
    }

    try {
      const payload = buildPayload(formState, isEditMode)
      await onSubmit?.(payload)
    } catch (error) {
      setValidationError(error?.message || 'Failed to save staff profile.')
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {(validationError || submitError) && (
        <Alert
          variant="danger"
          title="Staff profile could not be saved"
          description={validationError || submitError}
        />
      )}

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          {!isEditMode && (
            <Select
              label="Staff user"
              value={formState.user_id}
              onValueChange={handleChange('user_id')}
              options={eligibleUserOptions}
              placeholder="Select an existing staff user"
              required
            />
          )}

          <Input
            label="Employee ID"
            value={formState.employee_id}
            onChange={handleChange('employee_id')}
            placeholder="EMP-001"
            disabled={isEditMode}
          />

          <Input
            label="Department"
            value={formState.department}
            onChange={handleChange('department')}
            placeholder="Operations"
          />

          <Input
            label="Position"
            value={formState.position}
            onChange={handleChange('position')}
            placeholder="Branch manager"
          />

          {!isEditMode && (
            <Input
              label="Hire date"
              type="date"
              value={formState.hire_date}
              onChange={handleChange('hire_date')}
            />
          )}

          <Select
            label="Employment type"
            value={formState.employment_type}
            onValueChange={handleChange('employment_type')}
            options={EMPLOYMENT_TYPES}
          />

          <Select
            label="Approval tier"
            value={formState.approval_tier}
            onValueChange={handleChange('approval_tier')}
            options={APPROVAL_TIERS}
          />

          <Select
            label="Supervisor"
            value={formState.supervisor}
            onValueChange={handleChange('supervisor')}
            options={supervisorOptions}
            placeholder="Select supervisor"
          />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Work Contact</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Office location"
            value={formState.office_location}
            onChange={handleChange('office_location')}
            placeholder="Head office"
          />
          <Input
            label="Work phone"
            value={formState.work_phone}
            onChange={handleChange('work_phone')}
            placeholder="+254700000000"
          />
          <Input
            label="Work email"
            type="email"
            value={formState.work_email}
            onChange={handleChange('work_email')}
            placeholder="staff@superlegitadvance.com"
          />
          <Input
            label="Max loan approval amount"
            type="number"
            min="0"
            step="0.01"
            value={formState.max_loan_approval_amount}
            onChange={handleChange('max_loan_approval_amount')}
            placeholder="0.00"
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Checkbox
            label="Can approve loans"
            checked={formState.can_approve_loans}
            onCheckedChange={handleChange('can_approve_loans')}
          />
          <Checkbox
            label="Can manage customers"
            checked={formState.can_manage_customers}
            onCheckedChange={handleChange('can_manage_customers')}
          />
          <Checkbox
            label="Can process payments"
            checked={formState.can_process_payments}
            onCheckedChange={handleChange('can_process_payments')}
          />
          <Checkbox
            label="Can generate reports"
            checked={formState.can_generate_reports}
            onCheckedChange={handleChange('can_generate_reports')}
          />
          <Checkbox
            label="Currently available"
            checked={formState.is_available}
            onCheckedChange={handleChange('is_available')}
          />
        </div>

        <div className="mt-4">
          <label className="ui-label" htmlFor="availability_note">Availability note</label>
          <textarea
            id="availability_note"
            className="ui-control min-h-24 w-full px-3 py-2"
            value={formState.availability_note}
            onChange={handleChange('availability_note')}
            placeholder="Optional note for leave, travel, or schedule constraints"
          />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Emergency and Banking</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Emergency contact name"
            value={formState.emergency_contact_name}
            onChange={handleChange('emergency_contact_name')}
          />
          <Input
            label="Emergency contact phone"
            value={formState.emergency_contact_phone}
            onChange={handleChange('emergency_contact_phone')}
          />
          <Input
            label="Relationship"
            value={formState.emergency_contact_relationship}
            onChange={handleChange('emergency_contact_relationship')}
          />
          <Input
            label="Bank name"
            value={formState.bank_name}
            onChange={handleChange('bank_name')}
          />
          <Input
            label="Bank account number"
            value={formState.bank_account_number}
            onChange={handleChange('bank_account_number')}
          />
          <Input
            label="Bank branch"
            value={formState.bank_branch}
            onChange={handleChange('bank_branch')}
          />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Advanced Settings</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="ui-label" htmlFor="permissions_json">Custom permissions JSON</label>
            <textarea
              id="permissions_json"
              className="ui-control min-h-32 w-full px-3 py-2 font-mono text-xs"
              value={formState.permissions_json}
              onChange={handleChange('permissions_json')}
              placeholder='{"export_reports": true}'
            />
          </div>

          <div>
            <label className="ui-label" htmlFor="work_schedule_json">Work schedule JSON</label>
            <textarea
              id="work_schedule_json"
              className="ui-control min-h-32 w-full px-3 py-2 font-mono text-xs"
              value={formState.work_schedule_json}
              onChange={handleChange('work_schedule_json')}
              placeholder='{"mon":"08:00-17:00","tue":"08:00-17:00"}'
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="ui-label" htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            className="ui-control min-h-24 w-full px-3 py-2"
            value={formState.notes}
            onChange={handleChange('notes')}
            placeholder="Internal notes for this staff profile"
          />
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEditMode ? 'Update staff profile' : 'Create staff profile'}
        </Button>
      </div>
    </form>
  )
}

export default StaffForm
