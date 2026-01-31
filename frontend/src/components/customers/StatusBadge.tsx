// frontend/src/components/customers/StatusBadge.tsx
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { getStatusColor } from '@/types/customers'

interface StatusBadgeProps {
  status: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = getStatusColor(status)
  
  const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    BLACKLISTED: 'Blacklisted',
    DECEASED: 'Deceased'
  }

  const variantMap: Record<string, any> = {
    success: 'default',
    warning: 'outline',
    error: 'destructive',
    default: 'secondary'
  }

  return (
    <Badge variant={variantMap[color] || 'secondary'}>
      {statusLabels[status] || status}
    </Badge>
  )
}