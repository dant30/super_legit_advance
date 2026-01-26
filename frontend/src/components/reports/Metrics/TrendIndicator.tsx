import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendIndicatorProps {
  label: string
  value: number
  trend: 'up' | 'down' | 'neutral'
  change: number
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ label, value, trend, change }) => {
  const colors = {
    up: 'text-success-600 bg-success-50 dark:bg-success-900/20',
    down: 'text-danger-600 bg-danger-50 dark:bg-danger-900/20',
    neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  }

  const icons = {
    up: <TrendingUp className="h-5 w-5" />,
    down: <TrendingDown className="h-5 w-5" />,
    neutral: <Minus className="h-5 w-5" />,
  }

  return (
    <div className={`p-4 rounded-lg flex items-center gap-3 ${colors[trend]}`}>
      {icons[trend]}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-lg font-bold">
          {value.toFixed(1)} <span className="text-xs">({change > 0 ? '+' : ''}{change.toFixed(1)}%)</span>
        </p>
      </div>
    </div>
  )
}

export default TrendIndicator