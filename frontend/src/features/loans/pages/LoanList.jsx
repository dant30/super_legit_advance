// frontend/src/pages/loans/LoanList.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import PageHeader from '@components/ui/PageHeader'
import { LoanFilters, LoanSearch, LoanStats, LoanTable } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'
import { normalizeLoanCollection } from '../services/loans'

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
  const { data: stats, isLoading: statsLoading } = useLoanStatsQuery()

  const loans =
    searchResults !== null ? normalizeLoanCollection(searchResults) : normalizeLoanCollection(data)

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
          <Button key="filters" className="w-full sm:w-auto" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>,
          <Button key="export" className="w-full sm:w-auto" onClick={handleExport}>
            Export
          </Button>,
          <Link to="/loans/create" key="create" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">New Loan</Button>
          </Link>,
        ]}
      />

      <LoanStats stats={stats} loading={statsLoading} />

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

