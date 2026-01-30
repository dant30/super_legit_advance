// frontend/src/components/shared/Pagination.tsx
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    pages.push(totalPages)

    return pages
  }

  const pages = getPageNumbers()
  const canGoBack = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className={clsx('flex items-center justify-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
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
                variant={page === currentPage ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={clsx(
                  'min-w-10 h-10 p-0',
                  page === currentPage
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        icon={<ChevronRight className="h-4 w-4" />}
      >
        Next
      </Button>
    </div>
  )
}

export default Pagination