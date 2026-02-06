// frontend/src/pages/repayments/RepaymentList.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/shared/PageHeader'
import Pagination from '@components/ui/Pagination'
import Button from '@components/ui/Button'
import SearchBar from '@components/shared/SearchBar'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import {
  RepaymentFilters,
  RepaymentTable,
  RepaymentStats,
} from '@components/repayments'

const RepaymentList = () => {
  const navigate = useNavigate()
  const {
    repayments,
    loading,
    pagination,
    getRepayments,
    getStats,
    setPage,
    setPageSize,
    formatCurrency,
    formatStatus,
  } = useRepaymentContext()

  const [filters, setFilters] = useState({})
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')

  const params = useMemo(() => {
    const next = { ...filters }
    if (search) next.search = search
    return next
  }, [filters, search])

  useEffect(() => {
    getRepayments(params)
  }, [params, pagination.page, pagination.pageSize])

  useEffect(() => {
    let mounted = true
    getStats().then((res) => mounted && setStats(res)).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <PageHeader
        title="Repayments"
        subTitle="Track and manage repayments"
        extra={[
          <Button key="create" onClick={() => navigate('/repayments/create')}>
            New Repayment
          </Button>
        ]}
      />

      <div className="mb-4">
        <SearchBar
          placeholder="Search repayment number, loan, customer"
          value={search}
          onChange={setSearch}
        />
      </div>

      <RepaymentFilters
        value={filters}
        onApply={setFilters}
        onReset={setFilters}
      />

      <div className="mt-4">
        <RepaymentStats stats={stats} />
      </div>

      <div className="mt-6">
        <RepaymentTable
          data={repayments}
          loading={loading}
          formatCurrency={formatCurrency}
          formatStatus={formatStatus}
          onView={(row) => navigate(`/repayments/${row.id}`)}
        />
      </div>

      <div className="mt-4">
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.count}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          showPageSize
        />
      </div>
    </div>
  )
}

export default RepaymentList
