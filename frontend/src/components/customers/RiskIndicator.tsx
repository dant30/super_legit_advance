// frontend/src/components/customers/RiskIndicator.tsx
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'

interface RiskIndicatorProps {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  showLabel?: boolean
  showTooltip?: boolean
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  riskLevel,
  showLabel = true,
  showTooltip = true
}) => {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'LOW':
        return {
          color: 'bg-green-100 text-green-800',
          variant: 'success' as const,
          label: 'Low Risk',
          description: 'Customer has good credit history and low risk profile'
        }
      case 'MEDIUM':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          variant: 'outline' as const,
          label: 'Medium Risk',
          description: 'Customer has moderate credit history and average risk profile'
        }
      case 'HIGH':
        return {
          color: 'bg-red-100 text-red-800',
          variant: 'destructive' as const,
          label: 'High Risk',
          description: 'Customer has poor credit history and high risk profile'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          variant: 'secondary' as const,
          label: 'Unknown',
          description: 'Risk level not assessed'
        }
    }
  }

  const config = getRiskConfig()

  const content = (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <div className={`h-2 w-2 rounded-full ${config.color.split(' ')[0]}`} />
        {showLabel && (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        )}
      </div>
    </div>
  )

  if (showTooltip) {
    return (
      <Tooltip content={config.description}>
        {content}
      </Tooltip>
    )
  }

  return content
}