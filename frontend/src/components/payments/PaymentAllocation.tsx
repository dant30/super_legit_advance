import { useState } from 'react'
import { Wallet } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

interface PaymentAllocationProps {
  totalDue: number
  principalDue: number
  interestDue: number
  penaltyDue: number
  feesDue: number
  onAllocationChange?: (allocation: PaymentAllocationData) => void
}

export interface PaymentAllocationData {
  principal: number
  interest: number
  penalty: number
  fees: number
}

export default function PaymentAllocation({
  totalDue,
  principalDue,
  interestDue,
  penaltyDue,
  feesDue,
  onAllocationChange,
}: PaymentAllocationProps) {
  const [totalPayment, setTotalPayment] = useState(totalDue)
  const [allocation, setAllocation] = useState<PaymentAllocationData>({
    principal: principalDue,
    interest: interestDue,
    penalty: penaltyDue,
    fees: feesDue,
  })

  const handleAutoAllocate = () => {
    // Allocate in priority order: Fees > Penalty > Interest > Principal
    const newAllocation = { principal: 0, interest: 0, penalty: 0, fees: 0 }
    let remaining = totalPayment

    // 1. Fees first
    const feeAllocation = Math.min(remaining, feesDue)
    newAllocation.fees = feeAllocation
    remaining -= feeAllocation

    // 2. Penalty
    const penaltyAllocation = Math.min(remaining, penaltyDue)
    newAllocation.penalty = penaltyAllocation
    remaining -= penaltyAllocation

    // 3. Interest
    const interestAllocation = Math.min(remaining, interestDue)
    newAllocation.interest = interestAllocation
    remaining -= interestAllocation

    // 4. Principal (rest)
    newAllocation.principal = remaining

    setAllocation(newAllocation)
    onAllocationChange?.(newAllocation)
  }

  const handleManualAllocation = (type: keyof PaymentAllocationData, value: number) => {
    const newAllocation = { ...allocation }
    newAllocation[type] = Math.max(0, Math.min(value, eval(`${type}Due`)))

    const total = newAllocation.principal + newAllocation.interest + newAllocation.penalty + newAllocation.fees
    if (total <= totalPayment) {
      setAllocation(newAllocation)
      onAllocationChange?.(newAllocation)
    }
  }

  const allocatedTotal = allocation.principal + allocation.interest + allocation.penalty + allocation.fees
  const remaining = totalPayment - allocatedTotal

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-primary-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Payment Allocation</h3>
        </div>
        <button
          onClick={handleAutoAllocate}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Auto-Allocate
        </button>
      </div>

      <div className="space-y-4">
        {/* Total Payment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Total Payment
          </label>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            KES {totalPayment.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Allocation Items */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fees (Due: KES {feesDue.toLocaleString()})
            </label>
            <Input
              type="number"
              step="0.01"
              value={allocation.fees}
              onChange={(e) => handleManualAllocation('fees', Number(e.target.value))}
            />
            <div className="text-xs text-gray-500 mt-1">
              Progress: {((allocation.fees / feesDue) * 100).toFixed(1)}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Penalty (Due: KES {penaltyDue.toLocaleString()})
            </label>
            <Input
              type="number"
              step="0.01"
              value={allocation.penalty}
              onChange={(e) => handleManualAllocation('penalty', Number(e.target.value))}
            />
            <div className="text-xs text-gray-500 mt-1">
              Progress: {((allocation.penalty / penaltyDue) * 100).toFixed(1)}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interest (Due: KES {interestDue.toLocaleString()})
            </label>
            <Input
              type="number"
              step="0.01"
              value={allocation.interest}
              onChange={(e) => handleManualAllocation('interest', Number(e.target.value))}
            />
            <div className="text-xs text-gray-500 mt-1">
              Progress: {((allocation.interest / interestDue) * 100).toFixed(1)}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Principal (Due: KES {principalDue.toLocaleString()})
            </label>
            <Input
              type="number"
              step="0.01"
              value={allocation.principal}
              onChange={(e) => handleManualAllocation('principal', Number(e.target.value))}
            />
            <div className="text-xs text-gray-500 mt-1">
              Progress: {((allocation.principal / principalDue) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Allocated:</span>
            <span className="font-semibold">
              KES {allocatedTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`flex justify-between p-3 rounded-lg ${
            remaining === 0
              ? 'bg-success-50 dark:bg-success-900/20'
              : 'bg-warning-50 dark:bg-warning-900/20'
          }`}>
            <span className={`font-semibold ${
              remaining === 0
                ? 'text-success-700 dark:text-success-200'
                : 'text-warning-700 dark:text-warning-200'
            }`}>
              Remaining:
            </span>
            <span className={`font-bold ${
              remaining === 0
                ? 'text-success-600 dark:text-success-400'
                : 'text-warning-600 dark:text-warning-400'
            }`}>
              KES {remaining.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}