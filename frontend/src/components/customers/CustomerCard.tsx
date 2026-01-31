// frontend/src/components/customers/CustomerCard.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Customer } from '@/types/customers'
import { getStatusColor, formatPhoneNumber } from '@/types/customers'
import clsx from 'clsx'

interface CustomerCardProps {
  customer: Customer
  onEdit?: (customer: Customer) => void
  onBlacklist?: (customer: Customer) => void
  onViewDetail?: (customer: Customer) => void
  compact?: boolean
  showActions?: boolean
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onBlacklist,
  onViewDetail,
  compact = false,
  showActions = true
}) => {
  const navigate = useNavigate()

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(customer)
    } else {
      navigate(`/customers/${customer.id}`)
    }
  }

  const getStatusIcon = () => {
    switch (customer.status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-5 w-5 text-success-600" />
      case 'INACTIVE':
        return <Clock className="h-5 w-5 text-warning-600" />
      case 'BLACKLISTED':
        return <AlertCircle className="h-5 w-5 text-danger-600" />
      default:
        return null
    }
  }

  const getRiskBadgeColor = () => {
    switch (customer.risk_level) {
      case 'LOW':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
      case 'MEDIUM':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300'
      case 'HIGH':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  if (compact) {
    return (
      <div 
        onClick={handleViewDetail}
        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {customer.full_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {customer.phone_number}
            </p>
          </div>
        </div>

        {/* Status and Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusIcon()}
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <Card hoverable className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
            {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
          </div>

          {/* Name and Number */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {customer.full_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{customer.customer_number}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0 ml-2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 flex-1">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatPhoneNumber(customer.phone_number)}</span>
          </div>

          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}

          {customer.physical_address && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{customer.physical_address}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Loans</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {customer.active_loans}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              KES {(customer.outstanding_balance / 1000).toFixed(0)}k
            </p>
          </div>
        </div>

        {/* Risk Level and Status */}
        <div className="flex items-center gap-2 pt-2">
          <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', getRiskBadgeColor())}>
            {customer.risk_level} Risk
          </span>
          <span className={clsx(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            customer.status === 'ACTIVE'
              ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
              : customer.status === 'BLACKLISTED'
              ? 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300'
              : 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300'
          )}>
            {customer.status}
          </span>
        </div>
      </div>

      {/* Footer - Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleViewDetail}
          >
            View Details
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(customer)}
            >
              Edit
            </Button>
          )}
          {onBlacklist && customer.status !== 'BLACKLISTED' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-danger-600 hover:text-danger-700"
              onClick={() => onBlacklist(customer)}
            >
              Blacklist
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default CustomerCard