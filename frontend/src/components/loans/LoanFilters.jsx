// frontend/src/components/loans/LoanFilters.jsx
import React from 'react'
import { LOAN_STATUS_LABELS, LOAN_TYPE_LABELS, RISK_LEVEL } from '@api/loans'

const LoanFilters = ({ filters = {}, onChange, onReset }) => {
  const handleChange = (key) => (e) => {
    onChange?.(key, e.target.value)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-gray-600">Status</label>
          <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={filters.status || ''} onChange={handleChange('status')}>
            <option value="">All</option>
            {Object.entries(LOAN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Loan Type</label>
          <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={filters.loan_type || ''} onChange={handleChange('loan_type')}>
            <option value="">All</option>
            {Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Risk Level</label>
          <select className="mt-1 w-full rounded-md border-gray-300 text-sm" value={filters.risk_level || ''} onChange={handleChange('risk_level')}>
            <option value="">All</option>
            {Object.values(RISK_LEVEL).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Min Amount</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-gray-300 text-sm"
            value={filters.min_amount || ''}
            onChange={handleChange('min_amount')}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Max Amount</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-gray-300 text-sm"
            value={filters.max_amount || ''}
            onChange={handleChange('max_amount')}
            placeholder="1000000"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Start Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border-gray-300 text-sm"
            value={filters.start_date || ''}
            onChange={handleChange('start_date')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">End Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border-gray-300 text-sm"
            value={filters.end_date || ''}
            onChange={handleChange('end_date')}
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="w-full rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
            onClick={onReset}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoanFilters
