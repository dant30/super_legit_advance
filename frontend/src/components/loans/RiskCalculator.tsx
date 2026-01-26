import { useState } from 'react'
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface RiskFactors {
  creditScore: number
  debtToIncomeRatio: number
  loanAmount: number
  monthlyIncome: number
  existingLoans: number
  employmentStatus: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED'
  collateralValue: number
  yearsInBusiness: number
}

interface RiskResult {
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendation: string
  factors: Array<{
    name: string
    weight: number
    impact: 'POSITIVE' | 'NEGATIVE'
  }>
}

interface RiskCalculatorProps {
  onResultChange?: (result: RiskResult) => void
}

export default function RiskCalculator({ onResultChange }: RiskCalculatorProps) {
  const [factors, setFactors] = useState<RiskFactors>({
    creditScore: 700,
    debtToIncomeRatio: 30,
    loanAmount: 100000,
    monthlyIncome: 50000,
    existingLoans: 1,
    employmentStatus: 'EMPLOYED',
    collateralValue: 150000,
    yearsInBusiness: 5,
  })

  const calculateRiskScore = (): RiskResult => {
    let score = 50 // Start at 50

    // Credit score impact (0-30 points)
    if (factors.creditScore >= 750) score += 30
    else if (factors.creditScore >= 700) score += 25
    else if (factors.creditScore >= 650) score += 15
    else if (factors.creditScore >= 600) score += 10
    else score += 5

    // Debt to Income ratio impact (-20 to 20)
    if (factors.debtToIncomeRatio <= 20) score += 20
    else if (factors.debtToIncomeRatio <= 35) score += 10
    else if (factors.debtToIncomeRatio <= 50) score -= 5
    else score -= 20

    // Employment status
    if (factors.employmentStatus === 'EMPLOYED') score += 15
    else if (factors.employmentStatus === 'SELF_EMPLOYED') score += 10
    else score -= 15

    // Collateral LTV
    const ltv = (factors.loanAmount / factors.collateralValue) * 100
    if (ltv <= 50) score += 20
    else if (ltv <= 70) score += 10
    else if (ltv <= 100) score -= 5
    else score -= 15

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score))

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    if (score >= 70) riskLevel = 'LOW'
    else if (score >= 50) riskLevel = 'MEDIUM'
    else riskLevel = 'HIGH'

    const result: RiskResult = {
      riskScore: score,
      riskLevel,
      recommendation:
        riskLevel === 'LOW'
          ? 'Recommend approval. Low risk applicant.'
          : riskLevel === 'MEDIUM'
            ? 'Recommend further review. Consider additional collateral or lower amount.'
            : 'Recommend rejection or significant risk mitigation measures.',
      factors: [
        {
          name: 'Credit Score',
          weight: factors.creditScore / 850,
          impact: factors.creditScore >= 650 ? 'POSITIVE' : 'NEGATIVE',
        },
        {
          name: 'Debt-to-Income Ratio',
          weight: (100 - factors.debtToIncomeRatio) / 100,
          impact: factors.debtToIncomeRatio <= 35 ? 'POSITIVE' : 'NEGATIVE',
        },
        {
          name: 'Employment Status',
          weight: factors.employmentStatus === 'EMPLOYED' ? 1 : 0.7,
          impact: factors.employmentStatus !== 'UNEMPLOYED' ? 'POSITIVE' : 'NEGATIVE',
        },
        {
          name: 'Collateral Coverage',
          weight: Math.min(1, factors.collateralValue / factors.loanAmount),
          impact: ltv <= 70 ? 'POSITIVE' : 'NEGATIVE',
        },
      ],
    }

    onResultChange?.(result)
    return result
  }

  const result = calculateRiskScore()
  const getRiskColor = () => {
    switch (result.riskLevel) {
      case 'LOW':
        return 'bg-success-100 dark:bg-success-900/20 border-success-200 dark:border-success-800'
      case 'MEDIUM':
        return 'bg-warning-100 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
      case 'HIGH':
        return 'bg-danger-100 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'
    }
  }

  const getRiskTextColor = () => {
    switch (result.riskLevel) {
      case 'LOW':
        return 'text-success-800 dark:text-success-300'
      case 'MEDIUM':
        return 'text-warning-800 dark:text-warning-300'
      case 'HIGH':
        return 'text-danger-800 dark:text-danger-300'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Risk Assessment Calculator
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Credit Score"
            type="number"
            value={factors.creditScore}
            onChange={(e) => setFactors({ ...factors, creditScore: Number(e.target.value) })}
            min="300"
            max="850"
          />

          <Input
            label="Monthly Income (KES)"
            type="number"
            value={factors.monthlyIncome}
            onChange={(e) => setFactors({ ...factors, monthlyIncome: Number(e.target.value) })}
          />

          <Input
            label="Loan Amount (KES)"
            type="number"
            value={factors.loanAmount}
            onChange={(e) => setFactors({ ...factors, loanAmount: Number(e.target.value) })}
          />

          <Input
            label="Debt-to-Income Ratio (%)"
            type="number"
            value={factors.debtToIncomeRatio}
            onChange={(e) =>
              setFactors({ ...factors, debtToIncomeRatio: Number(e.target.value) })
            }
            min="0"
            max="100"
          />

          <Input
            label="Collateral Value (KES)"
            type="number"
            value={factors.collateralValue}
            onChange={(e) => setFactors({ ...factors, collateralValue: Number(e.target.value) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employment Status
            </label>
            <select
              value={factors.employmentStatus}
              onChange={(e) =>
                setFactors({
                  ...factors,
                  employmentStatus: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="EMPLOYED">Employed</option>
              <option value="SELF_EMPLOYED">Self-Employed</option>
              <option value="UNEMPLOYED">Unemployed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Risk Result */}
      <Card className={`p-6 border-2 ${getRiskColor()}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-sm font-medium ${getRiskTextColor()}`}>Risk Assessment</p>
            <h3 className={`text-3xl font-bold mt-2 ${getRiskTextColor()}`}>
              {result.riskLevel}
            </h3>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getRiskTextColor()}`}>{result.riskScore}</p>
            <p className={`text-xs font-medium mt-1 ${getRiskTextColor()}`}>Risk Score</p>
          </div>
        </div>

        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              result.riskLevel === 'LOW'
                ? 'bg-success-500'
                : result.riskLevel === 'MEDIUM'
                  ? 'bg-warning-500'
                  : 'bg-danger-500'
            }`}
            style={{ width: `${result.riskScore}%` }}
          />
        </div>

        <p className={`text-sm ${getRiskTextColor()}`}>{result.recommendation}</p>
      </Card>

      {/* Risk Factors */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Risk Factors</h4>
        <div className="space-y-3">
          {result.factors.map((factor, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {factor.name}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {(factor.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      factor.impact === 'POSITIVE' ? 'bg-success-500' : 'bg-danger-500'
                    }`}
                    style={{ width: `${factor.weight * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                {factor.impact === 'POSITIVE' ? (
                  <TrendingUp className="h-5 w-5 text-success-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-danger-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}