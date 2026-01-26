import React from 'react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

interface Column {
  key: string
  label: string
  format?: 'currency' | 'date' | 'percent' | 'text'
  sortable?: boolean
}

interface ReportTableProps {
  data: any[]
  columns: Column[]
  onRowClick?: (row: any) => void
}

const ReportTable: React.FC<ReportTableProps> = ({ data, columns, onRowClick }) => {
  const formatValue = (value: any, format?: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'date':
        return formatDate(value)
      case 'percent':
        return `${parseFloat(value).toFixed(2)}%`
      default:
        return value
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition"
            >
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className="px-4 py-3 text-gray-700 dark:text-gray-300"
                >
                  {formatValue(row[column.key], column.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      )}
    </div>
  )
}

export default ReportTable