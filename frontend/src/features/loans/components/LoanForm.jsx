// frontend/src/components/loans/LoanForm.jsx
import React, { useState } from 'react'
import { LOAN_TYPE, REPAYMENT_FREQUENCY } from '@api/loans'
import { Button, Card } from '@components/ui'

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

const LoanForm = ({ initialValues = {}, onSubmit, submitting = false }) => {
  const [values, setValues] = useState({
    customer: initialValues.customer || '',
    amount_requested: initialValues.amount_requested || '',
    term_months: initialValues.term_months || '',
    interest_rate: initialValues.interest_rate || '',
    loan_type: initialValues.loan_type || '',
    repayment_frequency: initialValues.repayment_frequency || 'MONTHLY',
    purpose: initialValues.purpose || '',
    notes: initialValues.notes || '',
  })

  const handleChange = (key) => (e) => {
    setValues(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(values)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="loan-customer" className="block text-xs font-medium text-gray-600">Customer ID</label>
          <input
            id="loan-customer"
            type="text"
            value={values.customer}
            onChange={handleChange('customer')}
            className="mt-1 w-full rounded-md border border-gray-300 text-sm"
            placeholder="Customer ID"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="loan-amount-requested" className="block text-xs font-medium text-gray-600">Amount Requested</label>
            <input
              id="loan-amount-requested"
              type="number"
              value={values.amount_requested}
              onChange={handleChange('amount_requested')}
              className="mt-1 w-full rounded-md border border-gray-300 text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="loan-term-months" className="block text-xs font-medium text-gray-600">Term (Months)</label>
            <input
              id="loan-term-months"
              type="number"
              value={values.term_months}
              onChange={handleChange('term_months')}
              className="mt-1 w-full rounded-md border border-gray-300 text-sm"
              placeholder="12"
            />
          </div>
          <div>
            <label htmlFor="loan-interest-rate" className="block text-xs font-medium text-gray-600">Interest Rate (%)</label>
            <input
              id="loan-interest-rate"
              type="number"
              value={values.interest_rate}
              onChange={handleChange('interest_rate')}
              className="mt-1 w-full rounded-md border border-gray-300 text-sm"
              placeholder="12.5"
            />
          </div>
          <div>
            <label htmlFor="loan-type" className="block text-xs font-medium text-gray-600">Loan Type</label>
            <select id="loan-type" className="mt-1 w-full rounded-md border border-gray-300 text-sm" value={values.loan_type} onChange={handleChange('loan_type')}>
              <option value="">Select</option>
              {Object.values(LOAN_TYPE).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="loan-repayment-frequency" className="block text-xs font-medium text-gray-600">Repayment Frequency</label>
            <select id="loan-repayment-frequency" className="mt-1 w-full rounded-md border border-gray-300 text-sm" value={values.repayment_frequency} onChange={handleChange('repayment_frequency')}>
              {Object.values(REPAYMENT_FREQUENCY).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="loan-purpose" className="block text-xs font-medium text-gray-600">Purpose</label>
          <select
            id="loan-purpose"
            value={values.purpose}
            onChange={handleChange('purpose')}
            className="mt-1 w-full rounded-md border border-gray-300 text-sm"
          >
            <option value="">Select purpose</option>
            {LOAN_PURPOSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="loan-notes" className="block text-xs font-medium text-gray-600">Notes</label>
          <textarea
            id="loan-notes"
            rows={3}
            value={values.notes}
            onChange={handleChange('notes')}
            className="mt-1 w-full rounded-md border border-gray-300 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="primary" htmlType="submit" loading={submitting}>
            Save Loan
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default LoanForm
