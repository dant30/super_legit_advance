// frontend/src/components/loans/LoanCalculator.jsx
import React, { useState } from 'react'
import { Card, Button } from '@components/ui'

const LoanCalculator = ({ onCalculate, result }) => {
  const [values, setValues] = useState({
    principal: '',
    interest_rate: '',
    term_months: '',
    interest_type: 'REDUCING_BALANCE',
    repayment_frequency: 'MONTHLY',
    processing_fee_percentage: '1.00',
  })

  const handleChange = (key) => (e) => {
    setValues(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onCalculate?.(values)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="text-sm font-semibold text-gray-900">Calculator</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Principal</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" value={values.principal} onChange={handleChange('principal')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Interest Rate (%)</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" value={values.interest_rate} onChange={handleChange('interest_rate')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Term (Months)</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" value={values.term_months} onChange={handleChange('term_months')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Interest Type</label>
            <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.interest_type} onChange={handleChange('interest_type')}>
              <option value="REDUCING_BALANCE">Reducing Balance</option>
              <option value="FIXED">Fixed</option>
              <option value="FLAT_RATE">Flat Rate</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Repayment Frequency</label>
            <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.repayment_frequency} onChange={handleChange('repayment_frequency')}>
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="DAILY">Daily</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Processing Fee (%)</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" value={values.processing_fee_percentage} onChange={handleChange('processing_fee_percentage')} />
          </div>
          <Button type="primary" htmlType="submit">Calculate</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-900">Results</h3>
        {!result ? (
          <p className="mt-3 text-sm text-gray-500">Enter values to calculate loan terms.</p>
        ) : (
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Monthly Payment</span>
              <span className="font-medium">{result.calculations?.monthly_payment || '--'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Interest</span>
              <span className="font-medium">{result.calculations?.total_interest || '--'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Amount Due</span>
              <span className="font-medium">{result.calculations?.total_amount_due || '--'}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LoanCalculator
