import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface KpiCardItem {
  label: string
  value: string | number
  trend?: 'up' | 'down'
  change?: number
  icon?: React.ReactNode
}

interface KpiCardsProps {
  kpis: KpiCardItem[]
}

const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {kpi.value}
              </p>
              {kpi.change !== undefined && (
                <p className={`text-xs mt-1 ${kpi.trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
                  {kpi.trend === 'up' ? '↑' : '↓'} {Math.abs(kpi.change)}%
                </p>
              )}
            </div>
            {kpi.icon && <div className="ml-4">{kpi.icon}</div>}
          </div>
        </Card>
      ))}
    </div>
  )
}

const kpis = [
  {
    label: 'Total Loans',
    value: reportData?.summary?.total_loans || 0,
    change: 12.5,
    trend: 'up' as const,
  },
  {
    label: 'Total Approved',
    value: `KES ${((reportData?.summary?.total_approved || 0) / 1000000).toFixed(1)}M`,
    change: 8.2,
    trend: 'up' as const,
  },
  // ...existing code...
]

export default KpiCards