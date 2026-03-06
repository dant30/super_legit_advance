import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageHeader from '@components/ui/PageHeader'
import { RepaymentForm } from '@components/repayments'
import { useRepaymentContext } from '@contexts/RepaymentContext'
import { useLoanContext } from '@contexts/LoanContext'
import { selectRepaymentsLoading } from '../store'

const ELIGIBLE_LOAN_STATUSES = new Set(['ACTIVE', 'APPROVED', 'OVERDUE'])

const RepaymentCreate = () => {
  const navigate = useNavigate()
  const loading = useSelector(selectRepaymentsLoading)
  const { createRepayment } = useRepaymentContext()
  const { useLoansQuery } = useLoanContext()
  const { data: loansPayload, isLoading: loansLoading } = useLoansQuery({ page_size: 100 })
  const [submitError, setSubmitError] = useState('')

  const loanOptions = useMemo(() => {
    const loans = Array.isArray(loansPayload)
      ? loansPayload
      : loansPayload?.results || []

    return loans
      .filter((loan) => ELIGIBLE_LOAN_STATUSES.has(String(loan?.status || '').toUpperCase()))
      .map((loan) => ({
        value: loan.id,
        label: `${loan.loan_number || 'Loan'}${loan.customer_name ? ` • ${loan.customer_name}` : ''}`,
      }))
  }, [loansPayload])

  const handleSubmit = async (data) => {
    setSubmitError('')

    try {
      const repayment = await createRepayment(data)
      const repaymentId = repayment?.id
      if (repaymentId) {
        navigate(`/repayments/${repaymentId}`)
        return
      }
      navigate('/repayments')
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

      setSubmitError(error?.message || 'Failed to create repayment.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Repayment"
        subTitle="Record a scheduled repayment against an eligible loan."
      />

      <RepaymentForm
        mode="create"
        loanOptions={loanOptions}
        loading={loading || loansLoading}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/repayments')}
      />
    </div>
  )
}

export default RepaymentCreate
