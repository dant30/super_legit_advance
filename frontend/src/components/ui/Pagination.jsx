// frontend/src/components/ui/Pagination.jsx
import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} PaginationProps
 * @property {number} page
 * @property {number} [pageSize]
 * @property {number} [totalItems]
 * @property {number} [totalPages]
 * @property {(page: number) => void} onPageChange
 * @property {boolean} [showPageSize]
 * @property {number[]} [pageSizeOptions]
 * @property {(size: number) => void} [onPageSizeChange]
 * @property {number} [siblingCount]
 * @property {string} [className]
 */

const Pagination = ({
  page,
  pageSize = 10,
  totalItems,
  totalPages,
  onPageChange,
  showPageSize = true,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  siblingCount = 1,
  className = '',
}) => {
  const calculatedTotalPages = totalPages ?? (totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1)
  if (calculatedTotalPages <= 1) return null

  const getPageNumbers = () => {
    const range = []
    const rangeWithDots = []
    const left = Math.max(1, page - siblingCount)
    const right = Math.min(calculatedTotalPages, page + siblingCount)

    for (let i = 1; i <= calculatedTotalPages; i += 1) {
      if (i === 1 || i === calculatedTotalPages || (i >= left && i <= right)) range.push(i)
    }

    let l
    for (const i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1)
        else if (i - l !== 1) rangeWithDots.push('...')
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  const startItem = totalItems ? (page - 1) * pageSize + 1 : null
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : null

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1)
  }

  const handleNext = () => {
    if (page < calculatedTotalPages) onPageChange(page + 1)
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {totalItems != null && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-2">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2 mr-4">
            <label htmlFor="page-size" className="text-sm text-gray-600 dark:text-gray-400">
              Show:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={handlePrevious}
            disabled={page === 1}
            className="inline-flex items-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium',
                    page === pageNum
                      ? 'bg-primary-600 text-white border border-primary-600'
                      : 'border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  )}
                  aria-current={page === pageNum ? 'page' : undefined}
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={handleNext}
            disabled={page === calculatedTotalPages}
            className="inline-flex items-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}

export default Pagination
