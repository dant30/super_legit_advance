// frontend/src/components/ui/List.jsx
import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { cn } from '@utils/cn'

/**
 * List Component
 * Reusable, feature-rich list with search, pagination, selection, and custom rendering
 *
 * Props:
 * - items: array of data
 * - renderItem: function to render each item
 * - keyExtractor: function to extract unique key
 * - searchable: enable search (boolean)
 * - selectable: enable selection with checkboxes (boolean)
 * - pageSize: items per page for pagination (default 10)
 * - actions: optional action buttons per item
 */
const List = ({
  items = [],
  renderItem,
  keyExtractor,
  searchable = false,
  selectable = false,
  pageSize = 10,
  actions = null,
  emptyText = 'No items found',
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [sortAsc, setSortAsc] = useState(true)

  const filteredItems = useMemo(() => {
    let filtered = [...items]
    if (searchable && searchTerm) {
      filtered = filtered.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered.sort((a, b) => {
      const aKey = String(keyExtractor(a))
      const bKey = String(keyExtractor(b))
      sortAsc
        ? aKey.localeCompare(bKey)
        : bKey.localeCompare(aKey)
    })
  }, [items, searchable, searchTerm, sortAsc, keyExtractor])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSelect = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === paginatedItems.length && paginatedItems.length > 0) {
      setSelected([])
    } else {
      setSelected(paginatedItems.map((item) => keyExtractor(item)))
    }
  }

  return (
    <section className={cn('ui-panel w-full p-4', className)} aria-label="List">
      {searchable && (
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="ui-control ui-control-md ui-focus flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search list items"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <ul className="divide-y divide-gray-200 dark:divide-slate-700" role="list">
          {selectable && paginatedItems.length > 0 && (
            <li className="flex items-center justify-between py-2 px-3 font-semibold text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.length === paginatedItems.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  aria-label="Select all items on this page"
                />
                <span>Select All</span>
              </div>
              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className="ui-focus flex items-center gap-1 rounded px-2 py-1 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={sortAsc ? 'Sort descending' : 'Sort ascending'}
              >
                Sort {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </li>
          )}

          {paginatedItems.length === 0 ? (
            <li className="py-6 text-center text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
              {emptyText}
            </li>
          ) : (
            paginatedItems.map((item) => {
              const key = keyExtractor(item)
              const isSelected = selected.includes(key)
              return (
                <li
                  key={key}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/60',
                    selectable && isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {selectable && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(key)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        aria-label={`Select ${String(key)}`}
                      />
                    )}
                    {renderItem(item)}
                  </div>
                  {actions && <div className="flex items-center gap-2">{actions(item)}</div>}
                </li>
              )
            })
          )}
        </ul>
      </div>

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="List pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="ui-focus rounded px-2 py-1 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-slate-700"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span>
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="ui-focus rounded px-2 py-1 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-slate-700"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  )
}

List.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  searchable: PropTypes.bool,
  selectable: PropTypes.bool,
  pageSize: PropTypes.number,
  actions: PropTypes.func,
  emptyText: PropTypes.string,
  className: PropTypes.string,
}

export default List
