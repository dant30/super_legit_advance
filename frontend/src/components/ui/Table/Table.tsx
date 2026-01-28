// frontend/src/components/ui/Table/Table.tsx
import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface Column<T> {
  accessor: keyof T | string
  header: string
  cell?: (info: any) => React.ReactNode
  width?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
}

const Table = React.forwardRef<HTMLTableElement, TableProps<any>>(
  ({ columns, data, loading, onRowClick }, ref) => {
    if (loading) {
      return <div className="p-4 text-center">Loading...</div>
    }

    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className="w-full border-collapse text-sm"
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="text-left font-medium text-gray-600 dark:text-gray-300 px-4 py-3"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(row)}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                {columns.map((column, colIdx) => (
                  <td
                    key={colIdx}
                    className="text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 px-4 py-3"
                  >
                    {column.cell
                      ? column.cell({ getValue: () => (row as any)[column.accessor as string] })
                      : (row as any)[column.accessor as string]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
)

Table.displayName = 'Table'

export default Table
