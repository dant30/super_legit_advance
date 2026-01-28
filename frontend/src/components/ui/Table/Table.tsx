// frontend/src/components/ui/Table/Table.tsx
import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface Column<T> {
  accessor: keyof T | string
  header: React.ReactNode
  width?: string | number
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row?: T) => React.ReactNode
  cell?: (value: any, row?: T) => React.ReactNode // alias
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: React.ReactNode

  // Sorting
  sortColumn?: string | number
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string | number, direction: 'asc' | 'desc') => void

  // Row keys & interactions
  rowKey?: keyof T | ((row: T) => string | number)
  onRowClick?: (row: T) => void

  // Selection
  selectable?: boolean
  selectedRows?: Array<string | number>
  onSelect?: (row: T) => void

  // Styling
  striped?: boolean
  hoverable?: boolean
  stickyHeader?: boolean
  className?: string
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found',

  sortColumn,
  sortDirection,
  onSort,

  rowKey = 'id',
  onRowClick,

  selectable = false,
  selectedRows = [],
  //onSelect,

  striped = true,
  hoverable = true,
  stickyHeader = false,
  className,
}: TableProps<T>) => {
  const resolveRowKey = (row: T) =>
    typeof rowKey === 'function' ? rowKey(row) : (row[rowKey as keyof T] as string | number)

  const toggleSort = (key: string | number) => {
    if (!onSort) return
    const direction =
      sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(key, direction)
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 border-b border-neutral-200" />
        ))}
      </div>
    )
  }

  return (
    <div className={clsx('card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="table">
          <thead
            className={clsx(
              'bg-neutral-50 dark:bg-neutral-800',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {selectable && <th className="w-10" />}

              {columns.map((col) => {
                const isSorted = sortColumn === String(col.accessor)
                return (
                  <th
                    key={String(col.accessor)}
                    style={{ width: col.width }}
                    onClick={() =>
                      col.sortable && toggleSort(String(col.accessor))
                    }
                    className={clsx(
                      col.sortable && 'cursor-pointer select-none',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && isSorted && (
                        sortDirection === 'asc' ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-12 text-neutral-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const id = resolveRowKey(row)
                const selected = selectedRows.includes(id)

                return (
                  <tr
                    key={String(id)}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      striped && index % 2 === 0 && 'bg-neutral-50',
                      hoverable && 'hover:bg-neutral-100',
                      selected && 'bg-primary-50',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {selectable && <td />}

                    {columns.map((col) => (
                      <td
                        key={`${String(id)}-${String(col.accessor)}`}
                        className={clsx(
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {col.render || col.cell
                          ? (col.render || col.cell)(row[col.accessor as string], row)
                          : String(row[col.accessor as string] ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
