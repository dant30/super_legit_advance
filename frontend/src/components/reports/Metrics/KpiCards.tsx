import React from 'react'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown } from 'lucide-react'

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

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {kpi.value}
              </p>
              {kpi.change !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                  kpi.trend === 'up' ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {kpi.change}%
                </div>
              )}
            </div>
            {kpi.icon && <div className="ml-4">{kpi.icon}</div>}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default KpiCards