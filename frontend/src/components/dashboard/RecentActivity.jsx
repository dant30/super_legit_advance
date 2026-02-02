import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card } from '@/components/ui/Card'
import { Clock, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react'
import { Loading } from '@/components/shared/Loading'

interface Activity {
  id: number
  type: 'loan_approved' | 'payment_received' | 'loan_created' | 'loan_rejected'
  message: string
  timestamp: string
  user?: string
}

const RecentActivities: React.FC = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async (): Promise<Activity[]> => {
      const response = await axiosInstance.get('/audit/?limit=10&action=')
      return response.data.results?.map((activity: any) => ({
        id: activity.id,
        type: activity.action,
        message: activity.description,
        timestamp: activity.created_at,
        user: activity.user_name,
      })) || []
    },
    staleTime: 1000 * 60 * 2,
  })

  if (isLoading) {
    return (
      <Card className="p-6">
        <Loading size="sm" />
      </Card>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'loan_approved':
        return <CheckCircle2 className="h-5 w-5 text-success-600" />
      case 'payment_received':
        return <DollarSign className="h-5 w-5 text-primary-600" />
      case 'loan_rejected':
        return <AlertCircle className="h-5 w-5 text-danger-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'loan_approved':
        return 'bg-success-50 dark:bg-success-900/20'
      case 'payment_received':
        return 'bg-primary-50 dark:bg-primary-900/20'
      case 'loan_rejected':
        return 'bg-danger-50 dark:bg-danger-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
        <Clock className="h-6 w-6 text-gray-400" />
      </div>

      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className={`p-3 rounded-lg ${getActivityColor(activity.type)} border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.message}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.user && <span>{activity.user} • </span>}
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">No recent activities</p>
        )}
      </div>
    </Card>
  )
}

export default RecentActivities