import React from 'react'

interface StatusFilterProps {
  value: string
  onChange: (status: string) => void
  options: Array<{ label: string; value: string }>
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange, options }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default StatusFilter