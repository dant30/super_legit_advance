import { useState } from 'react'
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface DisbursementTrackerProps {
  loanId: number
  approvedAmount: number
  disbursedAmount: number
  status: string
  onDisburse?: (amount: number) => void
}

export default function DisbursementTracker({
  loanId,
  approvedAmount,
  disbursedAmount,
  status,
  onDisburse,
}: DisbursementTrackerProps) {
  const [disbursementAmount, setDisbursementAmount] = useState(approvedAmount - disbursedAmount)
  const [method, setMethod] = useState<'BANK' | 'MPESA' | 'CASH'>('BANK')
  const [notes, setNotes] = useState('')

  const remainingAmount = approvedAmount - disbursedAmount
  const disbursementPercentage = (disbursedAmount / approvedAmount) * 100

  const handleDisburse = () => {
    if (disbursementAmount > remainingAmount) {
      alert(`Cannot disburse more than KES ${remainingAmount.toLocaleString()}`)
      return
    }
    onDisburse?.(disbursementAmount)
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Disbursement Tracker
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track and manage loan disbursement
        </p>
      </div>

      {/* Progress Section */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Disbursement Progress
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {disbursementPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
            style={{ width: `${disbursementPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              KES {approvedAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Disbursed</p>
            <p className="text-lg font-bold text-success-600">
              KES {disbursedAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-warning-600">
              KES {remainingAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Disbursement Form */}
      {status === 'APPROVED' && remainingAmount > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Process Disbursement
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Disbursement Amount (KES)
              </label>
              <input
                type="number"
                value={disbursementAmount}
                onChange={(e) => setDisbursementAmount(Number(e.target.value))}
                max={remainingAmount}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Max: KES {remainingAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Disbursement Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="BANK">Bank Transfer</option>
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={2}
                placeholder="Add disbursement notes"
              />
            </div>

            <Button onClick={handleDisburse} className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Process Disbursement
            </Button>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div
        className={`p-4 rounded-lg ${
          status === 'ACTIVE'
            ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800'
            : status === 'APPROVED'
              ? 'bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-start gap-3">
          {status === 'ACTIVE' ? (
            <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
          ) : status === 'APPROVED' ? (
            <Clock className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p
              className={`font-semibold ${
                status === 'ACTIVE'
                  ? 'text-success-800 dark:text-success-200'
                  : status === 'APPROVED'
                    ? 'text-warning-800 dark:text-warning-200'
                    : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {status === 'ACTIVE'
                ? 'Fully Disbursed'
                : status === 'APPROVED'
                  ? 'Awaiting Disbursement'
                  : 'Not Approved'}
            </p>
            <p
              className={`text-sm mt-1 ${
                status === 'ACTIVE'
                  ? 'text-success-700 dark:text-success-300'
                  : status === 'APPROVED'
                    ? 'text-warning-700 dark:text-warning-300'
                    : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {status === 'ACTIVE'
                ? 'The loan has been fully disbursed'
                : status === 'APPROVED'
                  ? 'The loan is approved and ready for disbursement'
                  : 'The loan must be approved before disbursement'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}