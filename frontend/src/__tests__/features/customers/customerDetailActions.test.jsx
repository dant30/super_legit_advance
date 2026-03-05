import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const contextState = {
  customer: null,
  loading: false,
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'cus-1' }),
    useNavigate: () => vi.fn(),
    Link: ({ children }) => <span>{children}</span>,
  }
})

vi.mock('@contexts/CustomerContext', () => ({
  useCustomerContext: () => ({
    selectedCustomer: contextState.customer,
    selectedCustomerLoading: contextState.loading,
    fetchCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
    blacklistCustomer: vi.fn(),
    activateCustomer: vi.fn(),
    getGuarantors: vi.fn(),
    guarantors: [],
    guarantorsLoading: false,
  }),
}))

vi.mock('@contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({ hasPermission: () => true }),
}))

vi.mock('@components/customers', () => ({
  CustomerProfile: () => <div>Customer Profile</div>,
  GuarantorsList: () => <div>Guarantors</div>,
  DocumentUpload: () => <div>Documents</div>,
  RiskIndicator: () => <div>Risk</div>,
}))

vi.mock('@components/ui', () => ({
  Card: ({ children }) => <div>{children}</div>,
  Button: ({ children, danger: _danger, ...props }) => <button type="button" {...props}>{children}</button>,
  Space: ({ children }) => <div>{children}</div>,
  Tabs: () => <div>Tabs</div>,
  Alert: ({ message }) => <div>{message}</div>,
  Spin: () => <div>Loading</div>,
  Modal: () => null,
  Descriptions: ({ children }) => <div>{children}</div>,
  Badge: ({ children }) => <div>{children}</div>,
}))

vi.mock('@components/ui/PageHeader', () => ({
  default: ({ extra }) => <div>{extra}</div>,
}))

vi.mock('@utils/formatters', () => ({
  formatCurrency: (value) => String(value),
  formatDate: () => '2026-03-05',
}))

import CustomerDetail from '../../../features/customers/pages/CustomerDetail'

describe('CustomerDetail lifecycle actions', () => {
  it('shows blacklist action when customer is active', () => {
    contextState.customer = {
      id: 'cus-1',
      customer_number: 'CUS-1',
      full_name: 'Mary Kariuki',
      status: 'ACTIVE',
      registration_date: '2026-01-01',
    }

    render(<CustomerDetail />)
    expect(screen.getByRole('button', { name: 'Blacklist' })).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'Activate' })).toBeNull()
  })

  it('shows activate action when customer is blacklisted', () => {
    contextState.customer = {
      id: 'cus-1',
      customer_number: 'CUS-1',
      full_name: 'Mary Kariuki',
      status: 'BLACKLISTED',
      registration_date: '2026-01-01',
    }

    render(<CustomerDetail />)
    expect(screen.getByRole('button', { name: 'Activate' })).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'Blacklist' })).toBeNull()
  })
})
