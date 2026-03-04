// frontend/src/components/repayments/PaymentReceipt.jsx
import React from 'react'
import Button from '@components/ui/Button'
import { Card, CardHeader, CardContent } from '@components/ui/Card'

const PaymentReceipt = ({ repayment, onPrint }) => {
  if (!repayment) return null

  const handlePrint = () => {
    if (onPrint) return onPrint(repayment)
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <Card>
      <CardHeader title="Payment Receipt" description="Receipt summary for this payment" />
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Receipt #</p>
            <p className="font-medium">{repayment.repayment_number}</p>
          </div>
          <div>
            <p className="text-gray-500">Loan</p>
            <p className="font-medium">{repayment?.loan?.loan_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-medium">{repayment?.customer?.full_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Payment Date</p>
            <p className="font-medium">
              {repayment.payment_date ? new Date(repayment.payment_date).toLocaleString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Amount Paid</p>
            <p className="font-medium">{repayment.amount_paid}</p>
          </div>
          <div>
            <p className="text-gray-500">Method</p>
            <p className="font-medium">{repayment.payment_method}</p>
          </div>
        </div>
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            Print Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentReceipt
