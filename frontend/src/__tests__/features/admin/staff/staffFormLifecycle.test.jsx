import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import StaffForm from '../../../../features/admin/staff/components/StaffForm'

describe('StaffForm lifecycle mapping', () => {
  it('maps create form fields into the backend create payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <StaffForm
        onSubmit={onSubmit}
        eligibleUsers={[
          {
            id: 'user-1',
            full_name: 'Jane Staff',
            email: 'jane@example.com',
            role: 'staff',
            role_display: 'Staff Member',
          },
        ]}
        supervisorUsers={[
          {
            id: 'user-2',
            full_name: 'John Supervisor',
            email: 'john@example.com',
            role: 'admin',
            role_display: 'Administrator',
          },
        ]}
      />
    )

    fireEvent.change(screen.getByLabelText(/Staff user/i), { target: { value: 'user-1' } })
    fireEvent.change(screen.getByLabelText(/Employee ID/i), { target: { value: 'EMP-001' } })
    fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'Operations' } })
    fireEvent.change(screen.getByLabelText(/Position/i), { target: { value: 'Officer' } })
    fireEvent.change(screen.getByLabelText(/Approval tier/i), { target: { value: 'senior' } })
    fireEvent.change(screen.getByLabelText(/Supervisor/i), { target: { value: 'user-2' } })
    fireEvent.change(screen.getByLabelText(/Work email/i), { target: { value: 'staff@example.com' } })
    fireEvent.click(screen.getByLabelText(/Can approve loans/i))
    fireEvent.click(screen.getByRole('button', { name: 'Create staff profile' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        employee_id: 'EMP-001',
        department: 'Operations',
        position: 'Officer',
        approval_tier: 'senior',
        supervisor: 'user-2',
        work_email: 'staff@example.com',
        can_approve_loans: true,
        permissions: {},
        work_schedule: {},
      })
    )
  })

  it('hides immutable create-only fields in edit mode', () => {
    render(
      <StaffForm
        initialData={{
          id: 'staff-1',
          user: 'user-1',
          employee_id: 'EMP-001',
          user_details: {
            full_name: 'Jane Staff',
          },
        }}
        onSubmit={vi.fn()}
        supervisorUsers={[]}
      />
    )

    expect(screen.queryByLabelText(/Staff user/i)).toBeNull()
    expect(screen.getByLabelText(/Employee ID/i).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Update staff profile' })).toBeTruthy()
  })
})
