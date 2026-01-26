import React from 'react'

interface SummaryTableProps {
  data: any[]
  columns: Array<{ key: string; label: string }>
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <td key={`${idx}-${col.key}`} className="px-4 py-2">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SummaryTable