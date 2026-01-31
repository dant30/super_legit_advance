// frontend/src/components/customers/CustomerFilters.tsx
import React from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import {
  GENDER_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  RISK_LEVEL_OPTIONS,
  MARITAL_STATUS_OPTIONS
} from '@/types/customers'
import type { CustomerListParams } from '@/types/customers'

interface CustomerFiltersProps {
  filters: CustomerListParams
  onFilterChange: (filters: Partial<CustomerListParams>) => void
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const handleInputChange = (key: keyof CustomerListParams, value: any) => {
    onFilterChange({ [key]: value })
  }

  const handleCheckboxChange = (key: keyof CustomerListParams, checked: boolean) => {
    onFilterChange({ [key]: checked })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: undefined,
      gender: undefined,
      marital_status: undefined,
      county: undefined,
      risk_level: undefined,
      active: undefined,
      blacklisted: undefined,
      has_loans: undefined,
      start_date: undefined,
      end_date: undefined
    })
  }

  const hasActiveFilters = Object.keys(filters).some(
    key => filters[key as keyof CustomerListParams] !== undefined && 
           !['page', 'page_size', 'ordering'].includes(key)
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <Input
          value={filters.search || ''}
          onChange={(e) => handleInputChange('search', e.target.value)}
          placeholder="Search customers..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <Select
          options={CUSTOMER_STATUS_OPTIONS}
          value={filters.status || ''}
          onChange={(value) => handleInputChange('status', value || undefined)}
          placeholder="All Statuses"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <Select
          options={GENDER_OPTIONS}
          value={filters.gender || ''}
          onChange={(value) => handleInputChange('gender', value || undefined)}
          placeholder="All Genders"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Risk Level
        </label>
        <Select
          options={RISK_LEVEL_OPTIONS}
          value={filters.risk_level || ''}
          onChange={(value) => handleInputChange('risk_level', value || undefined)}
          placeholder="All Risk Levels"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date Range
        </label>
        <div className="space-y-2">
          <Input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            placeholder="Start Date"
          />
          <Input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => handleInputChange('end_date', e.target.value)}
            placeholder="End Date"
          />
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Checkbox
          label="Active Customers"
          checked={filters.active === true}
          onChange={(checked) => handleCheckboxChange('active', checked)}
        />
        <Checkbox
          label="Blacklisted Customers"
          checked={filters.blacklisted === true}
          onChange={(checked) => handleCheckboxChange('blacklisted', checked)}
        />
        <Checkbox
          label="Customers with Loans"
          checked={filters.has_loans === true}
          onChange={(checked) => handleCheckboxChange('has_loans', checked)}
        />
      </div>
    </div>
  )
}

//export default CustomerFilters