// frontend/src/components/ui/Table.jsx
import React from 'react'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} Column
 * @property {string} key
 * @property {string|React.ReactNode} header
 * @property {'left'|'center'|'right'} [align]
 * @property {number|string} [width]
 * @property {(row: any, rowIndex: number) => React.ReactNode} [render]
 * @property {string} [className]
 */

/**
 * @typedef {Object} TableProps
 * @property {Column[]} columns
 * @property {any[]} data
 * @property {string|((row:any)=>string|number)} [rowKey]
 * @property {(row:any)=>void} [onRowClick]
 * @property {boolean} [loading]
 * @property {string|React.ReactNode} [emptyMessage]
 * @property {string} [caption]
 * @property {boolean} [striped]
 * @property {string} [className]
 */

export const Table = ({
  columns = [],
  data = [],
  rowKey,
  className,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  caption,
  striped = false,
}) => {
  const safeColumns = Array.isArray(columns) ? columns : []
  const safeData = Array.isArray(data) ? data : []

  const getRowKey = (row, idx) => {
    if (typeof rowKey === 'function') return rowKey(row)
    if (typeof rowKey === 'string') return row?.[rowKey]
    return row?.id ?? idx
  }

  return (
    <div className={cn('overflow-auto rounded-lg border border-gray-200 dark:border-slate-700', className)}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        {caption && <caption className="text-left text-sm text-gray-500 p-4">{caption}</caption>}
        <thead className="bg-gray-50 dark:bg-slate-800/50">
          <tr>
            {safeColumns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.className
                )}
                style={col.width ? { width: col.width } : undefined}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {loading && (
            <tr>
              <td colSpan={safeColumns.length} className="px-4 py-8 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </td>
            </tr>
          )}

          {!loading && safeData.length === 0 && (
            <tr>
              <td colSpan={safeColumns.length} className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
              </td>
            </tr>
          )}

          {!loading && safeData.length > 0 &&
            safeData.map((row, idx) => (
              <tr
                key={String(getRowKey(row, idx))}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50',
                  striped && idx % 2 === 1 && 'bg-gray-50/60 dark:bg-slate-800/60',
                  'transition-colors'
                )}
              >
                {safeColumns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render ? col.render(row, idx) : row?.[col.key] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
