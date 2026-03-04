// frontend/src/pages/repayments/RepaymentCreate.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/ui/PageHeader'
import { RepaymentForm } from '@components/repayments'
import { useSelector } from 'react-redux'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import { selectRepaymentsLoading } from '../store'

const RepaymentCreate = () => {
  const navigate = useNavigate()
  const loading = useSelector(selectRepaymentsLoading)
  const { createRepayment } = useRepaymentContext()

  const handleSubmit = async (data) => {
    const res = await createRepayment(data)
    const repaymentId = res?.id
    if (repaymentId) navigate(`/repayments/${repaymentId}`)
    else navigate('/repayments')
  }

  return (
    <div>
      <PageHeader
        title="Create Repayment"
        subTitle="Record a new repayment"
      />

      <RepaymentForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/repayments')}
        loading={loading}
        mode="create"
      />
    </div>
  )
}

export default RepaymentCreate


