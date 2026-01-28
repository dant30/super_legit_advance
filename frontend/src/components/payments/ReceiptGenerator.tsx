import { useState } from 'react'
import { FileText, Download, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Repayment } from '@/lib/api/repayments'

interface ReceiptGeneratorProps {
  repayment: Repayment
}

export default function ReceiptGenerator({ repayment }: ReceiptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const element = document.getElementById('receipt-content')
      if (!element) {
        toast.error('Receipt content not found')
        return
      }

      // Using html2pdf library
      const html2pdf = (await import('html2pdf.js')).default

      const options = {
        margin: 10,
        filename: `receipt-${repayment.repayment_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }

      html2pdf().set(options).from(element).save()
      toast.success('Receipt downloaded')
    } catch (error) {
      toast.error('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=500,width=800')
    const element = document.getElementById('receipt-content')
    if (printWindow && element) {
      printWindow.document.write(element.innerHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Payment Receipt</h3>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            disabled={isGenerating}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div id="receipt-content" className="space-y-6 p-6 bg-white border-2 border-gray-900">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-900 pb-4">
          <h1 className="text-2xl font-bold">SUPER LEGIT ADVANCE</h1>
          <p className="text-sm text-gray-600">Loan Management System</p>
          <p className="text-sm text-gray-600">Receipt #{repayment.receipt_number}</p>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">Date</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">Repayment #</p>
            <p>{repayment.repayment_number}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">Loan #</p>
            <p>{repayment.loan_number}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">Payment Method</p>
            <p>{repayment.payment_method}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-t-2 border-gray-900 pt-4">
          <p className="text-xs font-semibold uppercase text-gray-600 mb-2">Customer Details</p>
          <p className="font-semibold">{repayment.customer_name}</p>
          <p className="text-sm text-gray-600">{repayment.customer_number}</p>
        </div>

        {/* Payment Breakdown */}
        <div className="border-t-2 border-gray-900 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Principal Amount</span>
            <span>KES {repayment.principal_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Interest</span>
            <span>KES {repayment.interest_amount.toLocaleString()}</span>
          </div>
          {repayment.penalty_amount > 0 && (
            <div className="flex justify-between">
              <span>Penalty/Late Fee</span>
              <span>KES {repayment.penalty_amount.toLocaleString()}</span>
            </div>
          )}
          {repayment.fee_amount > 0 && (
            <div className="flex justify-between">
              <span>Fees</span>
              <span>KES {repayment.fee_amount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t-2 border-gray-900 pt-2 mt-2">
            <span>TOTAL PAID</span>
            <span>KES {repayment.amount_paid.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-900 pt-4 text-center text-xs text-gray-600">
          <p>Thank you for your payment</p>
          <p>This is a computer-generated receipt</p>
          <p className="mt-2 text-xs">{repayment.payment_reference}</p>
        </div>
      </div>
    </Card>
  )
}