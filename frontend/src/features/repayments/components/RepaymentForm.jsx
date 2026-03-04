// frontend/src/components/repayments/RepaymentForm.jsx
import React, { useState, useEffect } from 'react'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Button from '@components/ui/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@components/ui/Card'
import { cn } from '@utils/cn'
import { PAYMENT_METHOD, REPAYMENT_TYPE } from '@api/repayments'

const methodOptions = [
  { value: PAYMENT_METHOD.CASH, label: 'Cash' },
  { value: PAYMENT_METHOD.MPESA, label: 'M-Pesa' },
  { value: PAYMENT_METHOD.BANK, label: 'Bank' },
  { value: PAYMENT_METHOD.CHEQUE, label: 'Cheque' },
]

const typeOptions = [
  { value: REPAYMENT_TYPE.FULL, label: 'Full' },
  { value: REPAYMENT_TYPE.PARTIAL, label: 'Partial' },
  { value: REPAYMENT_TYPE.INTEREST_ONLY, label: 'Interest Only' },
]

const RepaymentForm = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
  className,
}) => {
  const [form, setForm] = useState({
    loan_id: '',
    customer_id: '',
    amount_due: '',
    amount_paid: '',
    due_date: '',
    payment_date: '',
    payment_method: PAYMENT_METHOD.MPESA,
    repayment_type: REPAYMENT_TYPE.FULL,
    payment_reference: '',
    transaction_id: '',
    notes: '',
    receipt_file: null,
  })

  useEffect(() => {
    if (initialValues) {
      setForm((prev) => ({ ...prev, ...initialValues }))
    }
  }, [initialValues])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <Card className={cn(className)}>
      <CardHeader
        title={mode === 'edit' ? 'Edit Repayment' : 'Create Repayment'}
        description="Capture repayment details and process payments"
      />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Loan ID"
              value={form.loan_id}
              onChange={(e) => update('loan_id', e.target.value)}
              placeholder="Loan ID"
              required
            />
            <Input
              label="Customer ID"
              value={form.customer_id}
              onChange={(e) => update('customer_id', e.target.value)}
              placeholder="Customer ID"
            />
            <Input
              label="Amount Due"
              type="number"
              value={form.amount_due}
              onChange={(e) => update('amount_due', e.target.value)}
              required
            />
            <Input
              label="Amount Paid"
              type="number"
              value={form.amount_paid}
              onChange={(e) => update('amount_paid', e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={form.due_date}
              onChange={(e) => update('due_date', e.target.value)}
            />
            <Input
              label="Payment Date"
              type="date"
              value={form.payment_date}
              onChange={(e) => update('payment_date', e.target.value)}
            />
            <Select
              label="Payment Method"
              options={methodOptions}
              value={form.payment_method}
              onValueChange={(v) => update('payment_method', v)}
            />
            <Select
              label="Repayment Type"
              options={typeOptions}
              value={form.repayment_type}
              onValueChange={(v) => update('repayment_type', v)}
            />
            <Input
              label="Payment Reference"
              value={form.payment_reference}
              onChange={(e) => update('payment_reference', e.target.value)}
            />
            <Input
              label="Transaction ID"
              value={form.transaction_id}
              onChange={(e) => update('transaction_id', e.target.value)}
            />
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                className="form-input min-h-[100px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Receipt File
              </label>
              <input
                type="file"
                onChange={(e) => update('receipt_file', e.target.files?.[0] || null)}
                className="form-input"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {mode === 'edit' ? 'Update Repayment' : 'Create Repayment'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default RepaymentForm
