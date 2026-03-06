import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageHeader from '@components/ui/PageHeader'
import { RepaymentForm } from '@components/repayments'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import { selectRepaymentsLoading, selectSelectedRepayment } from '../store'

const RepaymentEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const loading = useSelector(selectRepaymentsLoading)
  const selectedRepayment = useSelector(selectSelectedRepayment)
  const { getRepaymentById, updateRepayment } = useRepaymentContext()
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!id) return
    getRepaymentById(id).catch(() => {})
  }, [getRepaymentById, id])

  const initialValues = useMemo(() => {
    if (!selectedRepayment || selectedRepayment.id !== id) {
      return null
    }

    return {
      loan: selectedRepayment.loan,
      loan_number: selectedRepayment.loan_number,
      amount_paid: selectedRepayment.amount_paid,
      payment_method: selectedRepayment.payment_method,
      payment_date: selectedRepayment.payment_date,
      payment_reference: selectedRepayment.payment_reference,
      transaction_id: selectedRepayment.transaction_id,
      notes: selectedRepayment.notes,
    }
  }, [id, selectedRepayment])

  const handleSubmit = async (data) => {
    setSubmitError('')

    try {
      await updateRepayment(id, data)
      navigate(`/repayments/${id}`)
    } catch (error) {
      const payload = error?.response?.data
      if (typeof payload?.detail === 'string') {
        setSubmitError(payload.detail)
        return
      }

      const firstFieldError = payload && typeof payload === 'object'
        ? Object.values(payload).find((value) => typeof value === 'string' || (Array.isArray(value) && value.length > 0))
        : null

      if (typeof firstFieldError === 'string') {
        setSubmitError(firstFieldError)
        return
      }

      if (Array.isArray(firstFieldError)) {
        setSubmitError(firstFieldError[0])
        return
      }

      setSubmitError(error?.message || 'Failed to update repayment.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Repayment"
        subTitle={selectedRepayment?.repayment_number || 'Update recorded payment details.'}
      />

      <RepaymentForm
        mode="edit"
        initialValues={initialValues}
        loading={loading}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(id ? `/repayments/${id}` : '/repayments')}
      />
    </div>
  )
}

export default RepaymentEdit
