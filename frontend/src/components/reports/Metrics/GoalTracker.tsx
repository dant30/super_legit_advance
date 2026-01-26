import React from 'react'
import { Card } from '@/components/ui/Card'

interface Goal {
  label: string
  current: number
  target: number
  unit?: string
}

interface GoalTrackerProps {
  goals: Goal[]
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals }) => {
  return (
    <div className="space-y-4">
      {goals.map((goal, idx) => {
        const percentage = (goal.current / goal.target) * 100
        const isAchieved = percentage >= 100

        return (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">{goal.label}</span>
              <span className={`text-sm font-semibold ${
                isAchieved ? 'text-success-600' : 'text-warning-600'
              }`}>
                {goal.current.toFixed(0)} / {goal.target.toFixed(0)} {goal.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isAchieved ? 'bg-success-500' : 'bg-warning-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {percentage.toFixed(0)}% of target
            </p>
          </Card>
        )
      })}
    </div>
  )
}

export default GoalTracker