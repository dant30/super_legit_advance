import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { repaymentsAPI } from '@/lib/api/repayments'

interface PaymentFormProps {
  loanId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

interface PaymentFormData {
  amount: number
  payment_method: string
  payment_reference?: string
  notes?: string
}

export default function PaymentForm({ loanId, onSuccess, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PaymentFormData>()
  const paymentMethod = watch('payment_method')

  const onSubmit = async (data: PaymentFormData) => {
    if (!loanId) {
      toast.error('Loan ID is required')
      return
    }

    setIsLoading(true)
    try {
      await repaymentsAPI.processRepayment(loanId, {
        amount: data.amount,
        payment_method: data.payment_method as any,
        reference: data.payment_reference,
      })
      toast.success('Payment processed successfully')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to process payment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount *
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' }
            })}
          />
          {errors.amount && <p className="text-danger-600 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Method *
          </label>
          <select
            {...register('payment_method', { required: 'Payment method is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">Select method</option>
            <option value="MPESA">M-Pesa</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
          </select>
          {errors.payment_method && <p className="text-danger-600 text-sm mt-1">{errors.payment_method.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {paymentMethod === 'MPESA' ? 'M-Pesa Reference' : 'Payment Reference'}
          </label>
          <Input
            placeholder="Reference number"
            {...register('payment_reference')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="Additional notes..."
            {...register('notes')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Process Payment'}
          </Button>
        </div>
      </form>
    </Card>
  )
}