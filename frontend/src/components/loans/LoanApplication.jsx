// frontend/src/components/loans/LoanApplication.jsx
import React, { useState } from 'react'
import { Button, Card } from '@components/ui'
import { LOAN_TYPE } from '@api/loans'

const LoanApplication = ({ onSubmit, submitting = false }) => {
  const [values, setValues] = useState({
    customer: '',
    amount_requested: '',
    term_months: '',
    loan_type: '',
    purpose: '',
    notes: '',
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
      <h3 className="text-sm font-semibold text-gray-900">New Application</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600">Customer ID</label>
          <input className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.customer} onChange={handleChange('customer')} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Amount Requested</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" value={values.amount_requested} onChange={handleChange('amount_requested')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Term (Months)</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" value={values.term_months} onChange={handleChange('term_months')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Loan Type</label>
            <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.loan_type} onChange={handleChange('loan_type')}>
              <option value="">Select</option>
              {Object.values(LOAN_TYPE).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Purpose</label>
          <input className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.purpose} onChange={handleChange('purpose')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Notes</label>
          <textarea className="mt-1 w-full rounded-md border-gray-300 text-sm" rows={3} value={values.notes} onChange={handleChange('notes')} />
        </div>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Submit Application
        </Button>
      </form>
    </Card>
  )
}

export default LoanApplication
