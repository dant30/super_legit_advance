// frontend/src/pages/repayments/PaymentHistory.jsx
import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '@components/shared/PageHeader'
import Pagination from '@components/ui/Pagination'
import SearchBar from '@components/shared/SearchBar'
import { RepaymentTable } from '@components/repayments'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import { useNavigate } from 'react-router-dom'

const PaymentHistory = () => {
  const navigate = useNavigate()
  const {
    repayments,
    loading,
    pagination,
    getRepayments,
    setPage,
    setPageSize,
    formatCurrency,
    formatStatus,
  } = useRepaymentContext()

  const [search, setSearch] = useState('')

  const params = useMemo(() => {
    const next = { status: 'COMPLETED' }
    if (search) next.search = search
    return next
  }, [search])

  useEffect(() => {
    getRepayments(params)
  }, [params, pagination.page, pagination.pageSize])

  return (
    <div>
      <PageHeader title="Payment History" subTitle="Completed repayments" />

      <div className="mb-4">
        <SearchBar
          placeholder="Search repayment number, loan, customer"
          value={search}
          onChange={setSearch}
        />
      </div>

      <RepaymentTable
        data={repayments}
        loading={loading}
        formatCurrency={formatCurrency}
        formatStatus={formatStatus}
        onView={(row) => navigate(`/repayments/${row.id}`)}
      />

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

export default PaymentHistory
