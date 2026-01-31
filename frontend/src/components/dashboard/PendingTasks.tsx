import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { Loading } from '@/components/shared/Loading'

interface Task {
  id: number
  title: string
  type: 'approval' | 'document' | 'verification' | 'follow_up'
  priority: 'high' | 'medium' | 'low'
  dueDate: string
  relatedId?: number
}

const PendingTasks: React.FC = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['pendingTasks'],
    queryFn: async (): Promise<Task[]> => {
      const response = await axiosInstance.get('/loans/pending-approvals/')
      return response.data.results?.map((task: any) => ({
        id: task.id,
        title: `${task.customer_name} - Loan Application Review`,
        type: 'approval',
        priority: task.amount_requested > 500000 ? 'high' : 'medium',
        dueDate: task.application_date,
        relatedId: task.id,
      })) || []
    },
    staleTime: 1000 * 60 * 3,
  })

  if (isLoading) {
    return (
      <Card className="p-6">
        <Loading size="sm" />
      </Card>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-200'
      case 'medium':
        return 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-200'
      default:
        return 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="h-5 w-5" />
      case 'document':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pending Tasks</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tasks?.length || 0} tasks awaiting action</p>
        </div>
        <Clock className="h-6 w-6 text-primary-600" />
      </div>

      <div className="space-y-2">
        {tasks && tasks.length > 0 ? (
          tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <div className="mt-1">{getTypeIcon(task.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">No pending tasks</p>
        )}
      </div>

      {tasks && tasks.length > 5 && (
        <Button className="w-full" variant="secondary" size="sm">
          View All Tasks
        </Button>
      )}
    </Card>
  )
}

export default PendingTasks