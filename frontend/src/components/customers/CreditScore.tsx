import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface CreditScoreProps {
  score: number
  maxScore?: number
}

export default function CreditScore({ score, maxScore = 1000 }: CreditScoreProps) {
  const percentage = (score / maxScore) * 100
  
  const getScoreColor = () => {
    if (percentage >= 80) return 'success'
    if (percentage >= 60) return 'warning'
    return 'error'
  }

  const getScoreLabel = () => {
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 60) return 'Good'
    if (percentage >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credit Score</h3>
          <Badge variant={getScoreColor() as any}>{getScoreLabel()}</Badge>
        </div>

        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{score}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">out of {maxScore}</p>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              getScoreColor() === 'success'
                ? 'bg-success-500'
                : getScoreColor() === 'warning'
                  ? 'bg-warning-500'
                  : 'bg-error-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  )
}