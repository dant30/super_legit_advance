import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Button from '@components/ui/Button'
import { ConfirmationModal } from '@components/ui/Modal'
import PageHeader from '@components/ui/PageHeader'
import Pagination from '@components/ui/Pagination'
import SearchBar from '@components/ui/SearchBar'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import {
  selectRepayments,
  selectRepaymentsLoading,
  selectRepaymentsPagination,
} from '../store'
import {
  RepaymentFilters,
  RepaymentTable,
  RepaymentStats,
} from '@components/repayments'

const RepaymentList = () => {
  const navigate = useNavigate()
  const repayments = useSelector(selectRepayments)
  const loading = useSelector(selectRepaymentsLoading)
  const pagination = useSelector(selectRepaymentsPagination)
  const {
    getRepayments,
    getStats,
    deleteRepayment,
    setPage,
    setPageSize,
    formatCurrency,
    formatStatus,
  } = useRepaymentContext()

  const [filters, setFilters] = useState({})
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const params = useMemo(() => {
    const next = { ...filters }
    if (search) next.search = search
    return next
  }, [filters, search])

  useEffect(() => {
    getRepayments(params).catch(() => {})
  }, [getRepayments, params, pagination.page, pagination.pageSize])

  useEffect(() => {
    let mounted = true
    getStats()
      .then((res) => {
        if (mounted) setStats(res)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [getStats])

  const handleDelete = async () => {
    if (!deleteTarget?.id) return

    setDeleteError('')
    try {
      await deleteRepayment(deleteTarget.id)
      setDeleteTarget(null)
    } catch (error) {
      const payload = error?.response?.data
      if (typeof payload?.detail === 'string') {
        setDeleteError(payload.detail)
        return
      }
      setDeleteError(error?.message || 'Failed to delete repayment.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repayments"
        subTitle="Track, update, and resolve repayment records end to end."
        extra={[
          <Button key="create" className="w-full sm:w-auto" onClick={() => navigate('/repayments/create')}>
            New Repayment
          </Button>,
        ]}
      />

      {deleteError ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {deleteError}
        </div>
      ) : null}

      <div>
        <SearchBar
          placeholder="Search repayment number, loan, customer"
          value={search}
          onChange={setSearch}
        />
      </div>

      <RepaymentFilters
        value={filters}
        onApply={setFilters}
        onReset={() => setFilters({})}
      />

      <RepaymentStats stats={stats} />

      <RepaymentTable
        data={repayments}
        loading={loading}
        formatCurrency={formatCurrency}
        formatStatus={formatStatus}
        onView={(row) => navigate(`/repayments/${row.id}`)}
        onEdit={(row) => navigate(`/repayments/${row.id}/edit`)}
        onDelete={(row) => {
          setDeleteError('')
          setDeleteTarget(row)
        }}
      />

      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.count}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        showPageSize
      />

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null)
          setDeleteError('')
        }}
        onConfirm={handleDelete}
        title="Delete repayment"
        description={`Delete ${deleteTarget?.repayment_number || 'this repayment'}? This action cannot be undone.`}
        confirmText="Delete Repayment"
        loading={loading}
      />
    </div>
  )
}

export default RepaymentList
