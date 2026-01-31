// frontend/src/components/shared/Pagination.tsx
import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import clsx from 'clsx'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  
  // Optional enhanced features
  totalItems?: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  showPageSize?: boolean
  showInfo?: boolean
  showFirstLast?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  
  // Enhanced props with defaults
  totalItems = 0,
  pageSize = 20,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = false,
  showInfo = false,
  showFirstLast = false,
}) => {
  // Ensure numbers are valid
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))
  const safeTotalPages = Math.max(1, totalPages || 1)
  const safeTotalItems = Math.max(0, totalItems || 0)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (safeTotalPages <= maxVisible) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (safeCurrentPage > 3) {
      pages.push('...')
    }

    const start = Math.max(2, safeCurrentPage - 1)
    const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (safeCurrentPage < safeTotalPages - 2) {
      pages.push('...')
    }

    if (safeTotalPages > 1) {
      pages.push(safeTotalPages)
    }

    return pages
  }

  const pages = getPageNumbers()
  const canGoBack = safeCurrentPage > 1
  const canGoNext = safeCurrentPage < safeTotalPages
  const canGoFirst = safeCurrentPage > 1
  const canGoLast = safeCurrentPage < safeTotalPages

  // Calculate display range
  const startItem = safeTotalItems > 0 ? ((safeCurrentPage - 1) * pageSize) + 1 : 0
  const endItem = Math.min(safeCurrentPage * pageSize, safeTotalItems)

  if (safeTotalPages <= 1 && !showPageSize && !showInfo) {
    return null
  }

  // Render page size selector only
  if (showPageSize && !onPageChange) {
    return (
      <div className={clsx('flex items-center', className)}>
        <span className="text-sm text-gray-700 mr-4">Items per page:</span>
        <Select
          options={pageSizeOptions.map(size => ({ 
            value: size.toString(), 
            label: `${size} per page` 
          }))}
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange?.(parseInt(value))}
          className="w-40"
        />
      </div>
    )
  }

  // Simple pagination (backward compatible)
  if (!showPageSize && !showInfo && !showFirstLast) {
    return (
      <div className={clsx('flex items-center justify-center gap-2', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={!canGoBack}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
              ) : (
                <Button
                  variant={page === safeCurrentPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={clsx(
                    'min-w-10 h-10 p-0',
                    page === safeCurrentPage
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
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
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={!canGoNext}
          icon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    )
  }

  // Enhanced pagination
  return (
    <div className={clsx('flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t bg-white', className)}>
      {/* Left section: Page size selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center mb-4 sm:mb-0">
          <span className="text-sm text-gray-700 mr-4">Items per page:</span>
          <Select
            options={pageSizeOptions.map(size => ({ 
              value: size.toString(), 
              label: size.toString() 
            }))}
            value={pageSize.toString()}
            onChange={(value) => onPageSizeChange(parseInt(value))}
            className="w-20"
          />
        </div>
      )}

      {/* Center section: Item info */}
      {showInfo && safeTotalItems > 0 && (
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          Showing {startItem} to {endItem} of {safeTotalItems} items
        </div>
      )}

      {/* Right section: Page navigation */}
      <div className="flex items-center space-x-1">
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!canGoFirst}
            icon={<ChevronsLeft className="h-4 w-4" />}
          >
            First
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={!canGoBack}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="px-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={page === safeCurrentPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={clsx(
                    'min-w-10 h-10 p-0',
                    page === safeCurrentPage
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={!canGoNext}
          icon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>

        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={!canGoLast}
            icon={<ChevronsRight className="h-4 w-4" />}
          >
            Last
          </Button>
        )}
      </div>
    </div>
  )
}