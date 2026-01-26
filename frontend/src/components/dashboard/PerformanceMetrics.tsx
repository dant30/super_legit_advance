import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card } from '@/components/ui/Card'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import Loading from '@/components/shared/Loading'

interface PerformanceData {
  approval_rate: number
  disbursement_rate: number
  repayment_rate: number
  default_rate: number
  average_loan_size: number
}

const PerformanceMetrics: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['performanceMetrics'],
    queryFn: async (): Promise<PerformanceData> => {
      const response = await axiosInstance.get('/loans/stats/')
      return response.data.summary
    },
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <Card className="p-6">
        <Loading size="sm" />
      </Card>
    )
  }

  const metrics = [
    {
      label: 'Approval Rate',
      value: `${data?.approval_rate?.toFixed(1) || 0}%`,
      trend: 'up',
      change: 2.5,
    },
    {
      label: 'Repayment Rate',
      value: `${data?.repayment_rate?.toFixed(1) || 0}%`,
      trend: 'up',
      change: 1.2,
    },
    {
      label: 'Default Rate',
      value: `${data?.default_rate?.toFixed(1) || 0}%`,
      trend: 'down',
      change: 0.8,
    },
    {
      label: 'Avg Loan Size',
      value: `KES ${((data?.average_loan_size || 0) / 1000).toFixed(0)}K`,
      trend: 'up',
      change: 3.1,
    },
  ]

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance Metrics</h3>
        <BarChart3 className="h-6 w-6 text-primary-600" />
      </div>

      <div className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{metric.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
            </div>
            <div className="text-right">
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  metric.trend === 'up' ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {metric.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default PerformanceMetrics