// frontend/src/components/loans/LoanSearch.jsx
import React, { useState } from 'react'
import { Search } from 'lucide-react'

const SEARCH_TYPES = [
  { value: 'basic', label: 'All Fields' },
  { value: 'loan_number', label: 'Loan Number' },
  { value: 'customer_name', label: 'Customer Name' },
  { value: 'customer_phone', label: 'Customer Phone' },
  { value: 'customer_id', label: 'Customer ID' },
  { value: 'customer_email', label: 'Customer Email' },
]

const LoanSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('basic')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(query, type)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search loans..."
          className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm"
        />
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full md:w-48 rounded-md border border-gray-300 py-2 text-sm"
      >
        {SEARCH_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        Search
      </button>
    </form>
  )
}

export default LoanSearch
