import React, { useState } from 'react'
import {
  Card,
  Button,
  Select,
  Input,
  Row,
  Col,
  Space,
  Accordion,
} from '@components/ui'
import { DatePicker } from '@components/shared'
import { Search, X, Filter } from 'lucide-react'

const ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'OFFICER', label: 'Loan Officer' },
  { value: 'STAFF', label: 'Service Staff' },
]

const DEPARTMENTS = [
  { value: 'LOANS', label: 'Loans Department' },
  { value: 'COLLECTIONS', label: 'Collections' },
  { value: 'DISBURSEMENTS', label: 'Disbursements' },
  { value: 'ADMIN', label: 'Administration' },
  { value: 'IT', label: 'IT/Technical' },
]

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'TERMINATED', label: 'Terminated' },
]

const StaffFilters = ({ filters = {}, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [expandFilters, setExpandFilters] = useState(false)

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v !== '' && v !== null && v !== undefined
  ).length

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFilterChange?.(localFilters)
  }

  const handleClearFilters = () => {
    const cleared = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {})
    setLocalFilters(cleared)
    onFilterChange?.(cleared)
  }

  return (
    <Card className="shadow-soft">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, email, or ID..."
            prefix={<Search className="h-4 w-4" />}
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onPressEnter={handleApplyFilters}
            className="flex-1"
          />
          <Button type="primary" onClick={handleApplyFilters}>
            Search
          </Button>
        </div>

        {/* Expandable Filters Button */}
        <button
          onClick={() => setExpandFilters(!expandFilters)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-left font-medium transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </button>

        {/* Filters Content */}
        {expandFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium mb-2">
                  Role
                </label>
                <Select
                  placeholder="Select role"
                  options={ROLES}
                  value={localFilters.role || undefined}
                  onChange={(value) => handleFilterChange('role', value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium mb-2">
                  Department
                </label>
                <Select
                  placeholder="Select department"
                  options={DEPARTMENTS}
                  value={localFilters.department || undefined}
                  onChange={(value) =>
                    handleFilterChange('department', value)
                  }
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <Select
                  placeholder="Select status"
                  options={STATUSES}
                  value={localFilters.status || undefined}
                  onChange={(value) => handleFilterChange('status', value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium mb-2">
                  Date Range
                </label>
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  onChange={(dates) =>
                    handleFilterChange('dateRange', dates)
                  }
                />
              </Col>
            </Row>

            {/* Filter Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={handleClearFilters}>
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
              <Button type="primary" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default StaffFilters