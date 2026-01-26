import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import { repaymentsAPI } from '@/lib/api/repayments'

interface PaymentForm {
  loan_id: number
  amount_due: number
  principal_amount?: number
  interest_amount?: number
  penalty_amount?: number
  fee_amount?: number
  payment_method: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT_CARD' | 'OTHER'
  due_date: string
  payment_reference?: string
  notes?: string
  receipt_file?: FileList
}

export default function CollectPayment() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PaymentForm>()

  const paymentMethod = watch('payment_method')
  const principalAmount = watch('principal_amount') || 0
  const interestAmount = watch('interest_amount') || 0
  const penaltyAmount = watch('penalty_amount') || 0
  const feeAmount = watch('fee_amount') || 0
  const totalAmount = Number(principalAmount) + Number(interestAmount) + Number(penaltyAmount) + Number(feeAmount)

  const onSubmit = async (data: PaymentForm) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('loan', String(data.loan_id))
      formData.append('amount_due', String(totalAmount || data.amount_due))
      formData.append('principal_amount', String(data.principal_amount || 0))
      formData.append('interest_amount', String(data.interest_amount || 0))
      formData.append('penalty_amount', String(data.penalty_amount || 0))
      formData.append('fee_amount', String(data.fee_amount || 0))
      formData.append('payment_method', data.payment_method)
      formData.append('due_date', data.due_date)
      formData.append('payment_reference', data.payment_reference || '')
      formData.append('notes', data.notes || '')

      if (data.receipt_file?.[0]) {
        formData.append('receipt_file', data.receipt_file[0])
      }

      await repaymentsAPI.createRepayment(formData as any)
      toast.success('Payment recorded successfully')
      navigate('/repayments')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to record payment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Record Payment | Super Legit Advance</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/repayments')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Record Payment</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Record a new loan repayment</p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Loan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loan *
              </label>
              <Input
                type="number"
                placeholder="Enter loan ID"
                {...register('loan_id', { required: 'Loan is required' })}
              />
              {errors.loan_id && <p className="text-danger-600 text-sm mt-1">{errors.loan_id.message}</p>}
            </div>

            {/* Payment Amount Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Payment Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Principal Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('principal_amount', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interest Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('interest_amount', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Penalty Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('penalty_amount', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fees
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('fee_amount', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    KES {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method *
              </label>
              <select
                {...register('payment_method', { required: 'Payment method is required' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">Select payment method</option>
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.payment_method && <p className="text-danger-600 text-sm mt-1">{errors.payment_method.message}</p>}
            </div>

            {/* Payment Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {paymentMethod === 'MPESA' ? 'M-Pesa Reference' : 'Payment Reference'}
              </label>
              <Input
                placeholder={paymentMethod === 'MPESA' ? 'e.g., ABC123DEF45' : 'e.g., CHQ-001'}
                {...register('payment_reference')}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date *
              </label>
              <Input
                type="date"
                {...register('due_date', { required: 'Due date is required' })}
              />
              {errors.due_date && <p className="text-danger-600 text-sm mt-1">{errors.due_date.message}</p>}
            </div>

            {/* Receipt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Receipt (Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                {...register('receipt_file')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                placeholder="Additional payment details..."
                rows={3}
                {...register('notes')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/repayments')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loading size="sm" /> : 'Record Payment'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}