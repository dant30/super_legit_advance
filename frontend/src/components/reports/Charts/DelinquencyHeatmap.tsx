import React from 'react'

const DelinquencyHeatmap: React.FC = () => {
  const weeks = Array.from({ length: 26 }, (_, i) => i + 1)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (value < 5) return 'bg-green-200 dark:bg-green-900/30'
    if (value < 10) return 'bg-yellow-200 dark:bg-yellow-900/30'
    if (value < 15) return 'bg-orange-200 dark:bg-orange-900/30'
    return 'bg-red-200 dark:bg-red-900/30'
  }

  return (
    <div className="overflow-x-auto">
      <div className="space-y-2">
        <div className="flex gap-1">
          <div className="w-12" />
          {weeks.map((week) => (
            <div key={week} className="w-4 text-center text-xs text-gray-500">
              {week}
            </div>
          ))}
        </div>
        {days.map((day) => (
          <div key={day} className="flex gap-1">
            <div className="w-12 text-xs font-medium text-gray-700 dark:text-gray-300">
              {day}
            </div>
            {weeks.map((week) => {
              const value = Math.floor(Math.random() * 20)
              return (
                <div
                  key={`${day}-${week}`}
                  className={`w-4 h-4 rounded ${getColor(value)}`}
                  title={`${value} delinquent accounts`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 dark:bg-green-900/30 rounded" />
          <span>1-4</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/30 rounded" />
          <span>5-9</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-200 dark:bg-orange-900/30 rounded" />
          <span>10-14</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 dark:bg-red-900/30 rounded" />
          <span>15+</span>
        </div>
      </div>
    </div>
  )
}

export default DelinquencyHeatmap