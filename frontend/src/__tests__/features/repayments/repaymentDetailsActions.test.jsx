import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import RepaymentDetails from '../../../features/repayments/components/RepaymentDetails'

describe('RepaymentDetails lifecycle actions', () => {
  const baseProps = {
    onProcess: () => {},
    onWaive: () => {},
    onCancel: () => {},
    formatCurrency: (v) => String(v),
    formatStatus: (s) => s,
  }

  it('shows process/waive/cancel actions for pending repayment', () => {
    render(
      <RepaymentDetails
        {...baseProps}
        repayment={{
          repayment_number: 'REP-1',
          status: 'PENDING',
          amount_due: 2500,
          amount_paid: 0,
        }}
      />
    )

    expect(screen.getByRole('button', { name: 'Process Payment' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Waive Amount' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Cancel Repayment' })).not.toBeNull()
  })

  it('hides lifecycle mutation actions for completed repayment', () => {
    render(
      <RepaymentDetails
        {...baseProps}
        repayment={{
          repayment_number: 'REP-2',
          status: 'COMPLETED',
          amount_due: 2500,
          amount_paid: 2500,
        }}
      />
    )

    expect(screen.queryByRole('button', { name: 'Process Payment' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Waive Amount' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancel Repayment' })).toBeNull()
  })
})
