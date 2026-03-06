import React, { useEffect, useMemo, useState } from 'react'
import { INTEREST_TYPE, LOAN_TYPE, REPAYMENT_FREQUENCY } from '@api/loans'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'

const LOAN_PURPOSE_OPTIONS = [
  { value: 'MEDICAL', label: 'Medical Expenses' },
  { value: 'EDUCATION', label: 'Education Fees' },
  { value: 'BUSINESS_CAPITAL', label: 'Business Capital' },
  { value: 'HOME_IMPROVEMENT', label: 'Home Improvement' },
  { value: 'DEBT_CONSOLIDATION', label: 'Debt Consolidation' },
  { value: 'VEHICLE_PURCHASE', label: 'Vehicle Purchase' },
  { value: 'RENT', label: 'Rent Payment' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'OTHER', label: 'Other' },
]

const DEFAULT_VALUES = {
  customer: '',
  amount_requested: '',
  term_months: '',
  interest_rate: '',
  loan_type: '',
  repayment_frequency: 'MONTHLY',
  purpose: '',
  purpose_description: '',
  interest_type: 'FIXED',
  processing_fee_percentage: '1.00',
  late_payment_penalty_rate: '2.00',
  notes: '',
}

const normalizeInitialValues = (initialValues = {}) => ({
  customer: initialValues.customer || initialValues.customer_details?.id || '',
  amount_requested: initialValues.amount_requested || '',
  term_months: initialValues.term_months || '',
  interest_rate: initialValues.interest_rate || '',
  loan_type: initialValues.loan_type || '',
  repayment_frequency: initialValues.repayment_frequency || 'MONTHLY',
  purpose: initialValues.purpose || '',
  purpose_description: initialValues.purpose_description || '',
  interest_type: initialValues.interest_type || 'FIXED',
  processing_fee_percentage: initialValues.processing_fee_percentage || '1.00',
  late_payment_penalty_rate: initialValues.late_payment_penalty_rate || '2.00',
  notes: initialValues.notes || '',
})

const formatOptionLabel = (value) => value.replace(/_/g, ' ')

const LoanForm = ({
  initialValues = {},
  onSubmit,
  submitting = false,
  submitError = '',
  customerOptions = [],
  mode = 'create',
}) => {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...normalizeInitialValues(initialValues) })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues({ ...DEFAULT_VALUES, ...normalizeInitialValues(initialValues) })
    setErrors({})
  }, [initialValues])

  const selectedCustomerOption = useMemo(() => {
    const customerId = String(values.customer || initialValues.customer || '')
    return customerOptions.find((option) => String(option.value) === customerId) || null
  }, [customerOptions, initialValues.customer, values.customer])

  const handleChange = (key) => (eventOrValue) => {
    const nextValue = eventOrValue?.target?.value ?? eventOrValue
    setValues((prev) => ({ ...prev, [key]: nextValue }))
    setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const nextErrors = {}

    if (mode === 'create' && !values.customer) {
      nextErrors.customer = 'Borrower is required.'
    }
    if (!values.loan_type) {
      nextErrors.loan_type = 'Loan type is required.'
    }
    if (!values.purpose) {
      nextErrors.purpose = 'Purpose is required.'
    }
    if (!values.amount_requested || Number(values.amount_requested) <= 0) {
      nextErrors.amount_requested = 'Amount requested must be greater than zero.'
    }
    if (!values.term_months || Number(values.term_months) <= 0) {
      nextErrors.term_months = 'Loan term must be greater than zero.'
    }
    if (!values.interest_rate || Number(values.interest_rate) <= 0) {
      nextErrors.interest_rate = 'Interest rate must be greater than zero.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      return
    }

    await onSubmit?.({
      ...values,
      customer: values.customer ? Number(values.customer) : values.customer,
    })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError ? (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {submitError}
          </div>
        ) : null}

        {mode === 'create' ? (
          <Select
            label="Borrower"
            value={String(values.customer || '')}
            onValueChange={handleChange('customer')}
            options={customerOptions}
            placeholder="Select borrower"
            error={errors.customer}
            hint={!customerOptions.length ? 'No active borrowers loaded yet.' : undefined}
          />
        ) : (
          <Input
            label="Borrower"
            value={
              selectedCustomerOption?.label ||
              initialValues.customer_details?.full_name ||
              initialValues.customer_name ||
              'Borrower'
            }
            disabled
            hint={initialValues.customer_details?.customer_number || initialValues.customer_number || undefined}
          />
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Amount Requested"
            type="number"
            min="0"
            step="0.01"
            value={values.amount_requested}
            onChange={handleChange('amount_requested')}
            error={errors.amount_requested}
            placeholder="0.00"
          />
          <Input
            label="Term (Months)"
            type="number"
            min="1"
            step="1"
            value={values.term_months}
            onChange={handleChange('term_months')}
            error={errors.term_months}
            placeholder="12"
          />
          <Input
            label="Interest Rate (%)"
            type="number"
            min="0"
            step="0.01"
            value={values.interest_rate}
            onChange={handleChange('interest_rate')}
            error={errors.interest_rate}
            placeholder="12.5"
          />
          <Select
            label="Loan Type"
            value={values.loan_type}
            onValueChange={handleChange('loan_type')}
            options={Object.values(LOAN_TYPE).map((value) => ({ value, label: formatOptionLabel(value) }))}
            placeholder="Select loan type"
            error={errors.loan_type}
          />
          <Select
            label="Interest Type"
            value={values.interest_type}
            onValueChange={handleChange('interest_type')}
            options={Object.values(INTEREST_TYPE).map((value) => ({ value, label: formatOptionLabel(value) }))}
            placeholder="Select interest type"
          />
          <Select
            label="Repayment Frequency"
            value={values.repayment_frequency}
            onValueChange={handleChange('repayment_frequency')}
            options={Object.values(REPAYMENT_FREQUENCY).map((value) => ({ value, label: formatOptionLabel(value) }))}
            placeholder="Select repayment frequency"
          />
          <Input
            label="Processing Fee (%)"
            type="number"
            min="0"
            step="0.01"
            value={values.processing_fee_percentage}
            onChange={handleChange('processing_fee_percentage')}
            placeholder="1.00"
          />
          <Input
            label="Late Penalty Rate (%)"
            type="number"
            min="0"
            step="0.01"
            value={values.late_payment_penalty_rate}
            onChange={handleChange('late_payment_penalty_rate')}
            placeholder="2.00"
          />
        </div>

        <Select
          label="Purpose"
          value={values.purpose}
          onValueChange={handleChange('purpose')}
          options={LOAN_PURPOSE_OPTIONS}
          placeholder="Select purpose"
          error={errors.purpose}
        />

        <Input
          label="Purpose Description"
          value={values.purpose_description}
          onChange={handleChange('purpose_description')}
          placeholder="Short business justification or usage note"
        />

        <div>
          <label htmlFor="loan-notes" className="ui-label">Internal Notes</label>
          <textarea
            id="loan-notes"
            rows={3}
            value={values.notes}
            onChange={handleChange('notes')}
            className="ui-control ui-focus mt-1 w-full px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" loading={submitting}>
            {mode === 'edit' ? 'Save Changes' : 'Create Loan'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default LoanForm
