import React from 'react'

interface CustomerFilterProps {
  filters: {
    status: string
    county: string
    risk_level: string
  }
  onChange: (filters: any) => void
}

const CustomerFilter: React.FC<CustomerFilterProps> = ({ filters, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
      >
        <option value="all">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="BLACKLISTED">Blacklisted</option>
      </select>

      <select
        value={filters.county}
        onChange={(e) => onChange({ ...filters, county: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
      >
        <option value="">All Counties</option>
        <option value="Nairobi">Nairobi</option>
        <option value="Mombasa">Mombasa</option>
        <option value="Kisumu">Kisumu</option>
      </select>

      <select
        value={filters.risk_level}
        onChange={(e) => onChange({ ...filters, risk_level: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
      >
        <option value="">All Risk Levels</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
    </div>
  )
}

export default CustomerFilter