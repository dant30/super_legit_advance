import React from 'react'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPI {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon?: React.ReactNode
}

interface KpiCardsProps {
  kpis: KPI[]
}

const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {kpi.value}
              </p>
              {kpi.change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-success-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-success-600' : 'text-danger-600'
                    }`}
                  >
                    {Math.abs(kpi.change)}%
                  </span>
                </div>
              )}
            </div>
            {kpi.icon && <div className="text-4xl opacity-20">{kpi.icon}</div>}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default KpiCards