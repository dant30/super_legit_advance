// frontend/src/components/customers/CustomerSearch.tsx
import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { SearchType } from '@/types/customers'

interface CustomerSearchProps {
  onSearch: (query: string, type?: SearchType) => void
  placeholder?: string
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  onSearch,
  placeholder = 'Search customers...'
}) => {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('basic')

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), searchType)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const searchTypeOptions = [
    { value: 'basic', label: 'All Fields' },
    { value: 'name', label: 'Name Only' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'id', label: 'ID Number' },
    { value: 'customer_number', label: 'Customer Number' }
  ]

  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
      </div>
      <div className="w-40">
        <Select
          options={searchTypeOptions}
          value={searchType}
          onChange={(value) => setSearchType(value as SearchType)}
        />
      </div>
      <Button onClick={handleSearch}>
        Search
      </Button>
    </div>
  )
}

//export default CustomerSearch