// frontend/src/pages/loans/LoanCalculator.jsx
import React, { useState } from 'react'
import { PageHeader } from '@components/shared'
import { LoanCalculator } from '@components/loans'
import { useLoanContext } from '@contexts/LoanContext'

const LoanCalculatorPage = () => {
  const { useCalculateLoan } = useLoanContext()
  const calcMutation = useCalculateLoan()
  const [result, setResult] = useState(null)

  const handleCalculate = async (payload) => {
    const res = await calcMutation.mutateAsync(payload)
    setResult(res)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Loan Calculator" subTitle="Estimate payments and schedules" />
      <LoanCalculator onCalculate={handleCalculate} result={result} />
    </div>
  )
}

export default LoanCalculatorPage
