// frontend/src/components/customers/StatusBadge.tsx
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { getStatusColor } from '@/types/customers'

export interface StatusBadgeProps {
  status: string
}

type BadgeConfig = {
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
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

  const badgeMap: Record<string, BadgeConfig> = {
    success: { variant: 'success', tone: 'subtle' },
    warning: { variant: 'warning', tone: 'outline' },
    error: { variant: 'danger', tone: 'solid' },
    default: { variant: 'neutral', tone: 'subtle' },
  }

  const badge = badgeMap[color] ?? badgeMap.default

  return (
    <Badge variant={badge.variant} tone={badge.tone}>
      {statusLabels[status] ?? status}
    </Badge>
  )
}
