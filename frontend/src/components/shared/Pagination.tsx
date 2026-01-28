import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface PaginationProps {
  page: number
  total: number
  onPageChange: (page: number) => void
  pageSize?: number
}

const Pagination: React.FC<PaginationProps> = ({ page, total, onPageChange, pageSize = 1 }) => {
  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1)
  }

  const handleNext = () => {
    if (page < total) onPageChange(page + 1)
  }

  const renderPageButtons = () => {
    const buttons = []
    const maxButtons = 5
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2))
    let endPage = Math.min(total, startPage + maxButtons - 1)

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 rounded ${
            page === i
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      )
    }

    return buttons
  }

  if (total <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Page <span className="font-medium">{page}</span> of <span className="font-medium">{total}</span>
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1">{renderPageButtons()}</div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={page >= total}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default Pagination