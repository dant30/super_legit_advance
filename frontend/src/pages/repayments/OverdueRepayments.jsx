// frontend/src/pages/repayments/OverdueRepayments.jsx
import React, { useEffect, useState } from 'react'
import PageHeader from '@components/shared/PageHeader'
import { RepaymentTable } from '@components/repayments'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import { useNavigate } from 'react-router-dom'

const OverdueRepayments = () => {
  const navigate = useNavigate()
  const { getOverdueRepayments, loading, formatCurrency, formatStatus } = useRepaymentContext()
  const [rows, setRows] = useState([])

  useEffect(() => {
    let mounted = true
    getOverdueRepayments()
      .then((res) => {
        const list = res?.results || res || []
        if (mounted) setRows(list)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <PageHeader title="Overdue Repayments" subTitle="Repayments past due date" />
      <RepaymentTable
        data={rows}
        loading={loading}
        formatCurrency={formatCurrency}
        formatStatus={formatStatus}
        onView={(row) => navigate(`/repayments/${row.id}`)}
      />
    </div>
  )
}

export default OverdueRepayments
