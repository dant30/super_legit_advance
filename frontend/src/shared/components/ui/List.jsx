// frontend/src/components/ui/List.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';

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
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let filtered = items;
    if (searchable && searchTerm) {
      filtered = filtered.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) =>
      sortAsc
        ? keyExtractor(a).localeCompare(keyExtractor(b))
        : keyExtractor(b).localeCompare(keyExtractor(a))
    );
  }, [items, searchTerm, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === paginatedItems.length) {
      setSelected([]);
    } else {
      setSelected(paginatedItems.map((item) => keyExtractor(item)));
    }
  };

  return (
    <div className={cn('w-full bg-white dark:bg-neutral-800 rounded-xl shadow-card p-4', className)}>
      {searchable && (
        <div className="mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {selectable && paginatedItems.length > 0 && (
            <li className="flex items-center justify-between py-2 px-3 font-semibold text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.length === paginatedItems.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-400"
                />
                <span>Select All</span>
              </div>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Sort {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </li>
          )}

          {paginatedItems.length === 0 ? (
            <li className="text-center py-6 text-neutral-400 dark:text-neutral-500">
              No items found
            </li>
          ) : (
            paginatedItems.map((item) => {
              const key = keyExtractor(item);
              const isSelected = selected.includes(key);
              return (
                <li
                  key={key}
                  className={cn(
                    'flex items-center justify-between py-3 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition',
                    selectable && isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {selectable && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(key)}
                        className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-400"
                      />
                    )}
                    {renderItem(item)}
                  </div>
                  {actions && <div className="flex items-center gap-2">{actions(item)}</div>}
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4 text-sm text-neutral-500">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

List.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  searchable: PropTypes.bool,
  selectable: PropTypes.bool,
  pageSize: PropTypes.number,
  actions: PropTypes.func,
  className: PropTypes.string,
};

export default List;
