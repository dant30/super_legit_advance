import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card } from '@/components/ui/Card'
import { Users, TrendingUp, Award } from 'lucide-react'
import Loading from '@/components/shared/Loading'

interface CustomerStatsData {
  total_customers: number
  active_customers: number
  new_this_month: number
  blacklisted: number
  kyc_pending: number
  top_borrowers?: Array<{
    id: number
    name: string
    total_borrowed: number
    active_loans: number
  }>
}

const CustomerStats: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['customerStats'],
    queryFn: async (): Promise<CustomerStatsData> => {
      const response = await axiosInstance.get('/customers/stats/')
      return response.data
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

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Insights</h3>
        <Users className="h-6 w-6 text-primary-600" />
      </div>

      {/* Key Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.total_customers || 0}</p>
          </div>
          <Users className="h-6 w-6 text-primary-600" />
        </div>

        <div className="flex items-center justify-between p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.active_customers || 0}</p>
          </div>
          <TrendingUp className="h-6 w-6 text-success-600" />
        </div>

        <div className="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">New This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.new_this_month || 0}</p>
          </div>
          <Award className="h-6 w-6 text-warning-600" />
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
        {data?.kyc_pending && data.kyc_pending > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">KYC Pending</span>
            <span className="font-semibold text-warning-600">{data.kyc_pending}</span>
          </div>
        )}
        {data?.blacklisted && data.blacklisted > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Blacklisted</span>
            <span className="font-semibold text-danger-600">{data.blacklisted}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default CustomerStats