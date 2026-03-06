import React, { useEffect, useMemo, useState } from 'react'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Button from '@components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/Card'
import { cn } from '@utils/cn'
import { PAYMENT_METHOD, REPAYMENT_TYPE } from '../types'

const methodOptions = [
  { value: PAYMENT_METHOD.CASH, label: 'Cash' },
  { value: PAYMENT_METHOD.MPESA, label: 'M-Pesa' },
  { value: PAYMENT_METHOD.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PAYMENT_METHOD.CHEQUE, label: 'Cheque' },
]

const typeOptions = [
  { value: REPAYMENT_TYPE.FULL, label: 'Full' },
  { value: REPAYMENT_TYPE.PARTIAL, label: 'Partial' },
  { value: REPAYMENT_TYPE.INTEREST, label: 'Interest Only' },
]

const CREATE_DEFAULTS = {
  loan: '',
  amount_due: '',
  principal_amount: '',
  interest_amount: '',
  penalty_amount: '0',
  fee_amount: '0',
  payment_method: PAYMENT_METHOD.MPESA,
  repayment_type: REPAYMENT_TYPE.FULL,
  due_date: '',
  scheduled_date: '',
  payment_reference: '',
  notes: '',
  receipt_file: null,
}

const EDIT_DEFAULTS = {
  amount_paid: '',
  payment_method: PAYMENT_METHOD.MPESA,
  payment_date: '',
  payment_reference: '',
  transaction_id: '',
  notes: '',
  receipt_file: null,
}

const normalizeInitialValues = (initialValues = {}, mode = 'create') => {
  if (mode === 'edit') {
    return {
      ...EDIT_DEFAULTS,
      amount_paid: initialValues.amount_paid || '',
      payment_method: initialValues.payment_method || PAYMENT_METHOD.MPESA,
      payment_date: initialValues.payment_date
        ? new Date(initialValues.payment_date).toISOString().slice(0, 16)
        : '',
      payment_reference: initialValues.payment_reference || '',
      transaction_id: initialValues.transaction_id || '',
      notes: initialValues.notes || '',
      receipt_file: null,
    }
  }

  return {
    ...CREATE_DEFAULTS,
    loan: initialValues.loan || initialValues.loan_details?.id || '',
    amount_due: initialValues.amount_due || '',
    principal_amount: initialValues.principal_amount || initialValues.amount_due || '',
    interest_amount: initialValues.interest_amount || '0',
    penalty_amount: initialValues.penalty_amount || '0',
    fee_amount: initialValues.fee_amount || '0',
    payment_method: initialValues.payment_method || PAYMENT_METHOD.MPESA,
    repayment_type: initialValues.repayment_type || REPAYMENT_TYPE.FULL,
    due_date: initialValues.due_date || '',
    scheduled_date: initialValues.scheduled_date || '',
    payment_reference: initialValues.payment_reference || '',
    notes: initialValues.notes || '',
    receipt_file: null,
  }
}

const toNumber = (value) => Number(value || 0)

const RepaymentForm = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
  className,
  loanOptions = [],
  submitError = '',
}) => {
  const [form, setForm] = useState(normalizeInitialValues(initialValues, mode))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(normalizeInitialValues(initialValues, mode))
    setErrors({})
  }, [initialValues, mode])

  const selectedLoanOption = useMemo(() => {
    const loanId = String(form.loan || initialValues?.loan || '')
    return loanOptions.find((option) => String(option.value) === loanId) || null
  }, [form.loan, initialValues?.loan, loanOptions])

  const breakdownTotal =
    toNumber(form.principal_amount) +
    toNumber(form.interest_amount) +
    toNumber(form.penalty_amount) +
    toNumber(form.fee_amount)

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const nextErrors = {}

    if (mode === 'create') {
      if (!form.loan) nextErrors.loan = 'Loan is required.'
      if (!form.amount_due || toNumber(form.amount_due) <= 0) {
        nextErrors.amount_due = 'Amount due must be greater than zero.'
      }
      if (!form.due_date) nextErrors.due_date = 'Due date is required.'
      if (!form.scheduled_date) nextErrors.scheduled_date = 'Scheduled date is required.'
      if (Math.abs(breakdownTotal - toNumber(form.amount_due)) > 0.01) {
        nextErrors.amount_due = 'Breakdown amounts must sum to amount due.'
      }
    }

    if (mode === 'edit') {
      if (form.amount_paid !== '' && toNumber(form.amount_paid) < 0) {
        nextErrors.amount_paid = 'Amount paid cannot be negative.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const payload = { ...form }

    if (mode === 'edit' && !payload.payment_date) {
      delete payload.payment_date
    }

    await onSubmit?.(payload)
  }

  return (
    <Card className={cn(className)}>
      <CardHeader
        title={mode === 'edit' ? 'Edit Repayment' : 'Create Repayment'}
        description={mode === 'edit' ? 'Update repayment records and payment metadata' : 'Create a repayment schedule item for an existing loan'}
      />
      <form onSubmit={handleSubmit}>
        <CardContent>
          {submitError ? (
            <div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {submitError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {mode === 'create' ? (
              <Select
                label="Loan"
                options={loanOptions}
                value={String(form.loan || '')}
                onValueChange={(value) => update('loan', value)}
                placeholder="Select active loan"
                error={errors.loan}
                hint={!loanOptions.length ? 'No active loans loaded yet.' : undefined}
              />
            ) : (
              <Input
                label="Loan"
                value={selectedLoanOption?.label || initialValues?.loan_number || 'Loan'}
                disabled
                hint={initialValues?.customer_name || undefined}
              />
            )}

            <Select
              label="Payment Method"
              options={methodOptions}
              value={form.payment_method}
              onValueChange={(value) => update('payment_method', value)}
            />

            {mode === 'create' ? (
              <>
                <Input
                  label="Amount Due"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount_due}
                  onChange={(e) => update('amount_due', e.target.value)}
                  error={errors.amount_due}
                />
                <Select
                  label="Repayment Type"
                  options={typeOptions}
                  value={form.repayment_type}
                  onValueChange={(value) => update('repayment_type', value)}
                />
                <Input
                  label="Principal Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.principal_amount}
                  onChange={(e) => update('principal_amount', e.target.value)}
                />
                <Input
                  label="Interest Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.interest_amount}
                  onChange={(e) => update('interest_amount', e.target.value)}
                />
                <Input
                  label="Penalty Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.penalty_amount}
                  onChange={(e) => update('penalty_amount', e.target.value)}
                />
                <Input
                  label="Fee Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fee_amount}
                  onChange={(e) => update('fee_amount', e.target.value)}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => update('due_date', e.target.value)}
                  error={errors.due_date}
                />
                <Input
                  label="Scheduled Date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => update('scheduled_date', e.target.value)}
                  error={errors.scheduled_date}
                />
              </>
            ) : (
              <>
                <Input
                  label="Amount Paid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount_paid}
                  onChange={(e) => update('amount_paid', e.target.value)}
                  error={errors.amount_paid}
                  hint={`Amount due: ${initialValues?.amount_due || 0}`}
                />
                <Input
                  label="Payment Date"
                  type="datetime-local"
                  value={form.payment_date}
                  onChange={(e) => update('payment_date', e.target.value)}
                />
              </>
            )}

            <Input
              label="Payment Reference"
              value={form.payment_reference}
              onChange={(e) => update('payment_reference', e.target.value)}
            />

            {mode === 'edit' ? (
              <Input
                label="Transaction ID"
                value={form.transaction_id}
                onChange={(e) => update('transaction_id', e.target.value)}
              />
            ) : null}

            {mode === 'create' ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 md:col-span-2">
                Breakdown total: <span className="font-semibold text-gray-900">KES {breakdownTotal.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="md:col-span-2">
              <label className="ui-label">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                className="ui-control ui-focus min-h-[100px] w-full px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="ui-label">Receipt File</label>
              <input
                type="file"
                onChange={(e) => update('receipt_file', e.target.files?.[0] || null)}
                className="ui-control ui-focus w-full px-3 py-2 text-sm text-gray-900"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" loading={loading}>
            {mode === 'edit' ? 'Update Repayment' : 'Create Repayment'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default RepaymentForm
