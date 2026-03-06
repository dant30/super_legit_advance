import React, { useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import { Filter, Search, X } from 'lucide-react'

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
]

const AVAILABILITY_OPTIONS = [
  { value: 'true', label: 'Available' },
  { value: 'false', label: 'Unavailable' },
]

const APPROVAL_OPTIONS = [
  { value: 'true', label: 'Can approve loans' },
  { value: 'false', label: 'Cannot approve loans' },
]

const normalizeFilters = (filters) => ({
  search: filters.search || '',
  department: filters.department || '',
  employment_type: filters.employment_type || '',
  is_available: filters.is_available ?? '',
  can_approve_loans: filters.can_approve_loans ?? '',
})

const StaffFilters = ({ filters = {}, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(() => normalizeFilters(filters))
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setLocalFilters(normalizeFilters(filters))
  }, [filters])

  const handleChange = (field) => (eventOrValue) => {
    const value = eventOrValue?.target?.value ?? eventOrValue ?? ''
    setLocalFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleApply = () => {
    const nextFilters = Object.entries(localFilters).reduce((accumulator, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        accumulator[key] = value
      }
      return accumulator
    }, {})

    onFilterChange?.(nextFilters)
  }

  const handleClear = () => {
    const cleared = normalizeFilters({})
    setLocalFilters(cleared)
    onFilterChange?.({})
  }

  const activeCount = Object.values(localFilters).filter(Boolean).length

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          containerClassName="flex-1"
          placeholder="Search by name, email, employee ID or position"
          value={localFilters.search}
          onChange={handleChange('search')}
          prefix={<Search className="h-4 w-4" />}
          onPressEnter={handleApply}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExpanded((current) => !current)} leadingIcon={<Filter className="h-4 w-4" />}>
            Filters{activeCount ? ` (${activeCount})` : ''}
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid gap-4 border-t border-gray-200 pt-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Department"
            value={localFilters.department}
            onChange={handleChange('department')}
            placeholder="Operations"
          />
          <Select
            label="Employment type"
            value={localFilters.employment_type}
            onValueChange={handleChange('employment_type')}
            options={EMPLOYMENT_TYPES}
            placeholder="All employment types"
          />
          <Select
            label="Availability"
            value={String(localFilters.is_available)}
            onValueChange={handleChange('is_available')}
            options={AVAILABILITY_OPTIONS}
            placeholder="All staff"
          />
          <Select
            label="Loan approvals"
            value={String(localFilters.can_approve_loans)}
            onValueChange={handleChange('can_approve_loans')}
            options={APPROVAL_OPTIONS}
            placeholder="Any approval status"
          />

          <div className="md:col-span-2 xl:col-span-4 flex justify-end">
            <Button variant="ghost" leadingIcon={<X className="h-4 w-4" />} onClick={handleClear}>
              Clear filters
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default StaffFilters
