import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import { ConfirmationModal } from '@components/ui/Modal'
import PageHeader from '@components/ui/PageHeader'
import { LoanFilters, LoanSearch, LoanStats, LoanTable } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'
import { normalizeLoanCollection } from '../services/loans'

const LoanList = () => {
  const navigate = useNavigate()
  const {
    useLoansQuery,
    useLoanStatsQuery,
    useDeleteLoan,
    exportLoans,
    searchLoans,
  } = useLoanContext()

  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [loanToDelete, setLoanToDelete] = useState(null)

  const { data, isLoading } = useLoansQuery(filters)
  const { data: stats, isLoading: statsLoading } = useLoanStatsQuery()
  const deleteLoan = useDeleteLoan()

  const loans =
    searchResults !== null ? normalizeLoanCollection(searchResults) : normalizeLoanCollection(data)

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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

  const handleDelete = async () => {
    if (!loanToDelete) return
    await deleteLoan.mutateAsync(loanToDelete.id)
    setLoanToDelete(null)
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

      {showFilters ? (
        <LoanFilters filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      ) : null}

      <Card>
        <LoanTable
          loans={loans}
          loading={isLoading}
          onView={(nextId) => navigate(`/loans/${nextId}`)}
          onEdit={(nextId) => navigate(`/loans/${nextId}/edit`)}
          onDelete={(nextId) => setLoanToDelete(loans.find((loan) => loan.id === nextId) || { id: nextId })}
        />
      </Card>

      <ConfirmationModal
        open={Boolean(loanToDelete)}
        onClose={() => setLoanToDelete(null)}
        onConfirm={handleDelete}
        title="Delete loan"
        description="Only draft, rejected, or cancelled loans can be removed. This action cannot be undone."
        confirmText="Delete Loan"
        loading={deleteLoan.isPending}
      />
    </div>
  )
}

export default LoanList
