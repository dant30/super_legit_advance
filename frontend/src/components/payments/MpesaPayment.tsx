import { useState } from 'react'
import { Smartphone, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { mpesaAPI } from '@/lib/api/mpesa'

interface MpesaPaymentProps {
  loanId: number
  amount: number
  onSuccess?: () => void
}

export default function MpesaPayment({ loanId, amount, onSuccess }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInitiate = async () => {
    if (!phoneNumber) {
      toast.error('Please enter phone number')
      return
    }

    if (!phoneNumber.startsWith('254') || phoneNumber.length !== 12) {
      toast.error('Please enter valid M-Pesa number (254...)')
      return
    }

    setIsLoading(true)
    try {
      await mpesaAPI.initiateSTKPush({
        phone_number: phoneNumber,
        amount: amount,
        account_reference: `LOAN-${loanId}`,
        transaction_description: `Loan repayment for loan ${loanId}`,
      })
      toast.success('M-Pesa prompt sent. Enter PIN on your phone.')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initiate M-Pesa payment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Smartphone className="h-6 w-6 text-primary-600" />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">M-Pesa Payment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Amount: KES {amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number *
          </label>
          <Input
            type="tel"
            placeholder="254712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: 254712345678</p>
        </div>

        <Button
          onClick={handleInitiate}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Initiating...
            </>
          ) : (
            'Send M-Pesa Prompt'
          )}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded text-sm text-info-700 dark:text-info-200">
        <p className="font-semibold mb-1">How it works:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enter your M-Pesa registered phone number</li>
          <li>Click "Send M-Pesa Prompt"</li>
          <li>Enter your M-Pesa PIN when prompted</li>
          <li>Payment will be processed automatically</li>
        </ol>
      </div>
    </Card>
  )
}