// frontend/src/components/ui/Table.tsx
import React from 'react'
import { cn } from '@utils/cn'

export const Table = ({
  columns = [],
  data = [],
  rowKey,
  className,
  onRowClick,
  loading = false,
  emptyMessage = "No data available"
}) => {
  
  // Ensure columns and data are always arrays
  const safeColumns = Array.isArray(columns) ? columns : []
  const safeData = Array.isArray(data) ? data : []

  if (loading) {
    return (
      <div className={cn('overflow-auto rounded-md border', className)}>
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              {safeColumns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-medium text-gray-600')}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={safeColumns.length} className="px-4 py-8 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (safeData.length === 0) {
    return (
      <div className={cn('overflow-auto rounded-md border', className)}>
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              {safeColumns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-medium text-gray-600')}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={safeColumns.length} className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">{emptyMessage}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={cn('overflow-auto rounded-md border', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {safeColumns.map((col) => (
              <th 
                key={String(col.key)} 
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeData.map((row, idx) => {
            const key = rowKey ? rowKey(row) : (row.id ?? idx)
            return (
              <tr
                key={String(key)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : '',
                  'transition-colors duration-150'
                )}
              >
                {safeColumns.map((col) => (
                  <td 
                    key={String(col.key)} 
                    className={cn(
                      'px-4 py-3 text-sm text-gray-700 whitespace-nowrap',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
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

// DataTable with enhanced features
export const DataTable = ({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage,
  pagination,
  selection,
  className,
}) => {
  const [selectedRows, setSelectedRows] = React.useState(new Set())

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)))
    }
  }

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {selection && (
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-500">
            {selectedRows.size} of {data.length} selected
          </div>
        </div>
      )}
      
      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        loading={loading}
        emptyMessage={emptyMessage}
      />

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              disabled={!pagination.hasPrev}
              className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={!pagination.hasNext}
              className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table