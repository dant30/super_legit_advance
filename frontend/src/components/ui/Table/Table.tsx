// frontend/src/components/ui/Table/Table.tsx
import React from 'react'
import { cn } from '@/lib/utils/cn'

export type Column<T> = {
  key: string
  header: React.ReactNode
  render?: (row: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey?: (row: T) => string | number
  className?: string
  onRowClick?: (row: T) => void
}

function TableInner<T extends Record<string, any>>({ columns, data, rowKey, className, onRowClick }: TableProps<T>) {
  return (
    <div className={cn('overflow-auto rounded-md border', className)}>
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-2 text-left text-xs font-medium text-gray-600')}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y">
          {data.map((row, idx) => {
            const key = rowKey ? rowKey(row) : (row.id ?? idx)
            return (
              <tr
                key={String(key)}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick ? 'cursor-pointer hover:bg-gray-50' : '')}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-sm text-gray-700', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right')}>
                    {col.render ? col.render(row) : (row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TableInner
