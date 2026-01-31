// frontend/src/components/shared/Pagination.tsx
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  // Ensure numbers are valid
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))
  const safeTotalPages = Math.max(1, totalPages || 1)

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

  if (safeTotalPages <= 1) {
    return null
  }

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

// export default Pagination