// frontend/src/components/shared/Pagination.jsx
import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  totalItems = 0,
  pageSize = 20,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = false,
  showInfo = false,
  showFirstLast = false,
  compact = false,
  disabled = false,
  showBoundaries = true,
}) => {
  // Ensure numbers are valid
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))
  const safeTotalPages = Math.max(1, totalPages || 1)
  const safeTotalItems = Math.max(0, totalItems || 0)

  const getPageNumbers = () => {
    const pages = []
    
    if (compact) {
      // Compact mode: only show current page and maybe neighbors
      if (safeCurrentPage > 1) {
        pages.push(safeCurrentPage - 1)
      }
      pages.push(safeCurrentPage)
      if (safeCurrentPage < safeTotalPages) {
        pages.push(safeCurrentPage + 1)
      }
      return pages
    }

    const maxVisible = 7
    if (safeTotalPages <= maxVisible) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1)
    }

    // Always show first page
    if (showBoundaries) {
      pages.push(1)
    }

    // Calculate range
    let start = Math.max(2, safeCurrentPage - 2)
    let end = Math.min(safeTotalPages - 1, safeCurrentPage + 2)

    // Adjust if near boundaries
    if (safeCurrentPage <= 3) {
      end = Math.min(5, safeTotalPages - 1)
    } else if (safeCurrentPage >= safeTotalPages - 2) {
      start = Math.max(safeTotalPages - 4, 2)
    }

    // Add ellipsis before range if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add page numbers in range
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis after range if needed
    if (end < safeTotalPages - 1) {
      pages.push('...')
    }

    // Always show last page
    if (showBoundaries && safeTotalPages > 1) {
      pages.push(safeTotalPages)
    }

    return pages
  }

  const pages = getPageNumbers()
  const canGoBack = safeCurrentPage > 1 && !disabled
  const canGoNext = safeCurrentPage < safeTotalPages && !disabled
  const canGoFirst = safeCurrentPage > 1 && !disabled
  const canGoLast = safeCurrentPage < safeTotalPages && !disabled

  // Calculate display range
  const startItem = safeTotalItems > 0 ? ((safeCurrentPage - 1) * pageSize) + 1 : 0
  const endItem = Math.min(safeCurrentPage * pageSize, safeTotalItems)

  // Handle page change
  const handlePageChange = (page) => {
    if (!disabled && onPageChange) {
      onPageChange(page)
    }
  }

  // Handle page size change
  const handlePageSizeChange = (e) => {
    if (onPageSizeChange) {
      const newSize = parseInt(e.target.value)
      onPageSizeChange(newSize)
      // Reset to first page when page size changes
      if (onPageChange) {
        onPageChange(1)
      }
    }
  }

  // Early returns
  if (safeTotalPages <= 1 && !showPageSize && !showInfo) {
    return null
  }

  // Page size selector only mode
  if (showPageSize && !onPageChange) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Items per page:
        </span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          disabled={disabled}
          className="rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Simple pagination mode
  if (!showPageSize && !showInfo && !showFirstLast) {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(safeCurrentPage - 1)}
          disabled={!canGoBack || disabled}
          icon={<ChevronLeft className="h-4 w-4" />}
          className="min-w-[90px]"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="flex items-center justify-center h-10 w-10 text-neutral-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant={page === safeCurrentPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={disabled}
                  className={cn(
                    'h-10 w-10 p-0 min-w-0',
                    page === safeCurrentPage
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {String(page)}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(safeCurrentPage + 1)}
          disabled={!canGoNext || disabled}
          icon={<ChevronRight className="h-4 w-4" />}
          className="min-w-[90px]"
        >
          Next
        </Button>
      </div>
    )
  }

  // Enhanced pagination mode
  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      {/* Left section: Page size selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Items per page:
          </span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={disabled}
            className="rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Center section: Item info */}
      {showInfo && safeTotalItems > 0 && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{safeTotalItems.toLocaleString()}</span> items
        </div>
      )}

      {/* Right section: Page navigation */}
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={!canGoFirst || disabled}
            icon={<ChevronsLeft className="h-4 w-4" />}
            className="h-10 w-10 p-0"
          />
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(safeCurrentPage - 1)}
          disabled={!canGoBack || disabled}
          icon={<ChevronLeft className="h-4 w-4" />}
          className="h-10 w-10 p-0"
        />

        <div className="flex items-center gap-1">
          {pages.map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="flex items-center justify-center h-10 w-10 text-neutral-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant={page === safeCurrentPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={disabled}
                  className={cn(
                    'h-10 w-10 p-0 min-w-0',
                    page === safeCurrentPage
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {String(page)}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(safeCurrentPage + 1)}
          disabled={!canGoNext || disabled}
          icon={<ChevronRight className="h-4 w-4" />}
          className="h-10 w-10 p-0"
        />

        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(safeTotalPages)}
            disabled={!canGoLast || disabled}
            icon={<ChevronsRight className="h-4 w-4" />}
            className="h-10 w-10 p-0"
          />
        )}
      </div>
    </div>
  )
}

export default Pagination