// frontend/src/components/customers/StatusBadge.tsx
// frontend/src/components/customers/StatusBadge.tsx
import React from 'react'
import { Badge, BadgeVariant } from '@/components/ui/Badge'
import { getStatusColor } from '@/types/customers'

export interface StatusBadgeProps {
  status: string
}

type BadgeConfig = {
  variant: BadgeVariant
  tone?: 'subtle' | 'solid' | 'outline'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = getStatusColor(status)

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    BLACKLISTED: 'Blacklisted',
    DECEASED: 'Deceased',
  }

  // Map the color from getStatusColor to actual BadgeVariant values
  const badgeMap: Record<string, BadgeConfig> = {
    success: { variant: 'success' },
    warning: { variant: 'warning' },
    error: { variant: 'danger' },
    default: { variant: 'secondary' }, // Use 'secondary' instead of 'neutral'
  }

  const badge = badgeMap[color] ?? badgeMap.default

  return (
    <Badge variant={badge.variant}>
      {statusLabels[status] ?? status}
    </Badge>
  )
}