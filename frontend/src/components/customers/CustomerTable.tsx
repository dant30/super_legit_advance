// frontend/src/components/customers/CustomerTable.tsx
// frontend/src/components/customers/CustomerTable.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { StatusBadge } from './StatusBadge'
import { RiskIndicator } from './RiskIndicator'
import { formatPhoneNumber } from '@/lib/utils/formatters'
import { getStatusColor, getRiskLevelColor } from '@/types/customers'
import type { Customer } from '@/types/customers'

export interface CustomerTableProps {
  customers?: Customer[]
  loading?: boolean
  onViewDetail: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onBlacklist: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers = [],
  loading = false,
  onViewDetail,
  onEdit,
  onBlacklist,
  onDelete
}) => {
  const navigate = useNavigate()

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (customer: Customer) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="font-medium text-gray-700">
              {customer.first_name?.[0] || ''}{customer.last_name?.[0] || ''}
            </span>
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">
              {customer.full_name || `${customer.first_name} ${customer.last_name}`}
            </div>
            <div className="text-sm text-gray-500">
              {customer.customer_number || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">{formatPhoneNumber(customer.phone_number || '')}</div>
          {customer.email && (
            <div className="text-sm text-gray-500">{customer.email}</div>
          )}
        </div>
      )
    },
    {
      key: 'identification',
      header: 'ID',
      render: (customer: Customer) => (
        <div className="text-sm">
          <div>{customer.id_number || 'N/A'}</div>
          <div className="text-gray-500">{customer.id_type || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (customer: Customer) => <StatusBadge status={customer.status} />
    },
    {
      key: 'risk',
      header: 'Risk',
      render: (customer: Customer) => <RiskIndicator riskLevel={customer.risk_level} />
    },
    {
      key: 'loans',
      header: 'Loans',
      align: 'center' as const,
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">{customer.active_loans || 0}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right' as const,
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">
            KES {(customer.outstanding_balance || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Outstanding</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (customer: Customer) => (
        <div className="flex space-x-2 justify-end">
          <Tooltip content="View details">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetail(customer)
              }}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip content="Edit customer">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(customer)
              }}
            >
              Edit
            </Button>
          </Tooltip>
          {customer.status !== 'BLACKLISTED' && (
            <Tooltip content="Blacklist customer">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onBlacklist(customer)
                }}
              >
                Blacklist
              </Button>
            </Tooltip>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="No customers found. Add your first customer to get started."
        onRowClick={(customer) => onViewDetail(customer)}
      />
    </div>
  )
}

//export default CustomerTable