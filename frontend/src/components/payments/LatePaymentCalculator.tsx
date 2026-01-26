import { useState } from 'react'
import { Calculator } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface LatePaymentCalculatorProps {
  principalAmount: number
  interestRate?: number
  latePaymentRate?: number
  daysOverdue?: number
  onCalculate?: (penalty: number) => void
}

export default function LatePaymentCalculator({
  principalAmount,
  interestRate = 0,
  latePaymentRate = 2,
  daysOverdue = 0,
  onCalculate,
}: LatePaymentCalculatorProps) {
  const [customDays, setCustomDays] = useState<number | ''>(daysOverdue)
  const [customRate, setCustomRate] = useState<number | ''>(latePaymentRate)

  const days = typeof customDays === 'number' ? customDays : 0
  const rate = typeof customRate === 'number' ? customRate : 0

  // Calculate late fee: (Principal * Rate * Days) / 365
  const lateFee = (principalAmount * rate * days) / 365 / 100
  const totalPenalty = lateFee

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-6 w-6 text-primary-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Late Payment Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Principal Amount
          </label>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            KES {principalAmount.toLocaleString()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Days Overdue
          </label>
          <Input
            type="number"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value ? Number(e.target.value) : '')}
            placeholder="Number of days"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Late Payment Rate (%) per annum
          </label>
          <Input
            type="number"
            step="0.1"
            value={customRate}
            onChange={(e) => setCustomRate(e.target.value ? Number(e.target.value) : '')}
            placeholder="Rate percentage"
          />
        </div>

        {/* Calculation Summary */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Daily Rate:</span>
            <span className="font-semibold">
              {((principalAmount * rate) / 365 / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })} KES
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Late Fee:</span>
            <span className="font-semibold">
              KES {lateFee.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
            <span className="font-semibold text-danger-700 dark:text-danger-200">Total Penalty:</span>
            <span className="font-bold text-lg text-danger-600 dark:text-danger-400">
              KES {totalPenalty.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}