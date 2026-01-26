import React from 'react'
import { Card } from '@/components/ui/Card'
import { Target, TrendingUp } from 'lucide-react'
import Button from '@/components/ui/Button'

interface CollectionTargetProps {
  monthlyTarget: number
  monthlyCollected: number
  collectionRate: number
}

const CollectionTarget: React.FC<CollectionTargetProps> = ({
  monthlyTarget,
  monthlyCollected,
  collectionRate,
}) => {
  const remainingTarget = monthlyTarget - monthlyCollected
  const isOnTrack = collectionRate >= 75

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Collection Target</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This month's progress</p>
        </div>
        <div className={`p-3 rounded-lg ${isOnTrack ? 'bg-success-100 dark:bg-success-900/20' : 'bg-warning-100 dark:bg-warning-900/20'}`}>
          <Target className={`h-6 w-6 ${isOnTrack ? 'text-success-600' : 'text-warning-600'}`} />
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Target</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">KES {(monthlyTarget / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Collected</p>
          <p className="text-2xl font-bold text-success-600 mt-1">KES {(monthlyCollected / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Remaining</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">KES {(remainingTarget / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Collection Rate</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{collectionRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${isOnTrack ? 'bg-success-500' : 'bg-warning-500'}`}
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-3 rounded-lg mb-4 ${isOnTrack ? 'bg-success-50 dark:bg-success-900/20' : 'bg-warning-50 dark:bg-warning-900/20'}`}>
        <p className={`text-sm font-medium ${isOnTrack ? 'text-success-800 dark:text-success-200' : 'text-warning-800 dark:text-warning-200'}`}>
          {isOnTrack
            ? `🎉 You're on track to meet your target! ${remainingTarget > 0 ? `Only KES ${(remainingTarget / 1000).toFixed(0)}K remaining.` : 'Target exceeded!'}`
            : `⚠️ Behind target by KES ${(remainingTarget / 1000).toFixed(0)}K. Step up collection efforts!`}
        </p>
      </div>

      <Button className="w-full" size="sm">
        <TrendingUp className="h-4 w-4 mr-2" />
        View Collections
      </Button>
    </Card>
  )
}

export default CollectionTarget