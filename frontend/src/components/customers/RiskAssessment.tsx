import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

interface RiskAssessmentProps {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  creditScore: number
  loanPerformance: number
}

export default function RiskAssessment({
  riskLevel,
  creditScore,
  loanPerformance,
}: RiskAssessmentProps) {
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'LOW':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'MEDIUM':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'HIGH':
        return <AlertCircle className="h-6 w-6 text-red-600" />
    }
  }

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'LOW':
        return 'success'
      case 'MEDIUM':
        return 'warning'
      case 'HIGH':
        return 'error'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Assessment</h3>
          {getRiskIcon()}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
              <Badge variant={getRiskColor() as any}>{riskLevel}</Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Credit Score</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {creditScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(creditScore / 10, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Loan Performance</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {loanPerformance}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${Math.min(loanPerformance, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}