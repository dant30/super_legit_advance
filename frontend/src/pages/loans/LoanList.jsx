// frontend/src/pages/loans/LoanList.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '@components/ui'
import { PageHeader } from '@components/shared'
import { LoanFilters, LoanSearch, LoanStats, LoanTable } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'

const LoanList = () => {
  const navigate = useNavigate()
  const {
    useLoansQuery,
    useLoanStatsQuery,
    exportLoans,
    searchLoans,
  } = useLoanContext()

  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchResults, setSearchResults] = useState(null)

  const { data, isLoading } = useLoansQuery(filters)
  const { data: stats } = useLoanStatsQuery()

  const loans = searchResults || data?.results || data || []

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  const handleSearch = async (query, type) => {
    if (!query) {
      setSearchResults(null)
      return
    }
    const results = await searchLoans(query, type)
    setSearchResults(Array.isArray(results) ? results : results?.results || [])
  }

  const handleExport = async () => {
    await exportLoans('excel', filters)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans"
        subTitle="Manage and track all loans"
        extra={[
          <Button key="filters" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>,
          <Button key="export" onClick={handleExport}>
            Export
          </Button>,
          <Link to="/loans/create" key="create">
            <Button type="primary">New Loan</Button>
          </Link>,
        ]}
      />

      <LoanStats stats={stats} />

      <LoanSearch onSearch={handleSearch} />

      {showFilters && (
        <LoanFilters filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      )}

      <Card>
        <LoanTable
          loans={loans}
          loading={isLoading}
          onView={(id) => navigate(`/loans/${id}`)}
          onEdit={(id) => navigate(`/loans/${id}/edit`)}
        />
      </Card>
    </div>
  )
}

export default LoanList
