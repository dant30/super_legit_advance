import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Download, Copy } from 'lucide-react'
import { useLoans } from '@/hooks/useLoans'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'

interface CalculationResult {
  installment_amount: number
  total_interest: number
  total_amount_due: number
  processing_fee: number
  amortization_schedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
}

export default function LoanCalculator() {
  const navigate = useNavigate()
  const { calculateLoan } = useLoans()
  
  const [principal, setPrincipal] = useState<number>(100000)
  const [interestRate, setInterestRate] = useState<number>(15)
  const [termMonths, setTermMonths] = useState<number>(12)
  const [interestType, setInterestType] = useState<'FIXED' | 'REDUCING_BALANCE' | 'FLAT_RATE'>('REDUCING_BALANCE')
  const [processingFee, setProcessingFee] = useState<number>(2)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await calculateLoan({
        principal,
        interest_rate: interestRate,
        term_months: termMonths,
        interest_type: interestType,
        processing_fee_percentage: processingFee,
      })
      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate loan')
    } finally {
      setLoading(false)
    }
  }

  const downloadSchedule = () => {
    if (!result) return

    let csv = 'Month,Payment,Principal,Interest,Balance\n'
    result.amortization_schedule.forEach((row) => {
      csv += `${row.month},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'amortization_schedule.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <Helmet>
        <title>Loan Calculator | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/loans')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Calculator</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Calculate loan payments and amortization schedule
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <Card className="p-6 lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Parameters</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Principal Amount (KES)
              </label>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                KES {principal.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Interest Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loan Term (Months)
              </label>
              <Input
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interest Type
              </label>
              <select
                value={interestType}
                onChange={(e) => setInterestType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="REDUCING_BALANCE">Reducing Balance</option>
                <option value="FIXED">Fixed Interest</option>
                <option value="FLAT_RATE">Flat Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Processing Fee (%)
              </label>
              <Input
                type="number"
                step="0.1"
                value={processingFee}
                onChange={(e) => setProcessingFee(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate'}
            </Button>

            {error && (
              <div className="p-3 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-300 rounded-lg text-sm">
                {error}
              </div>
            )}
          </Card>

          {/* Results */}
          {result && (
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-primary-50 dark:bg-primary-900/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Monthly Payment
                  </p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                    KES {result.installment_amount.toLocaleString('en', { maximumFractionDigits: 2 })}
                  </p>
                </Card>

                <Card className="p-4 bg-success-50 dark:bg-success-900/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Total Interest
                  </p>
                  <p className="text-2xl font-bold text-success-600 dark:text-success-400 mt-2">
                    KES {result.total_interest.toLocaleString('en', { maximumFractionDigits: 2 })}
                  </p>
                </Card>

                <Card className="p-4 bg-warning-50 dark:bg-warning-900/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Processing Fee
                  </p>
                  <p className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-2">
                    KES {result.processing_fee.toLocaleString('en', { maximumFractionDigits: 2 })}
                  </p>
                </Card>

                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Total Amount Due
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    KES {result.total_amount_due.toLocaleString('en', { maximumFractionDigits: 2 })}
                  </p>
                </Card>
              </div>

              {/* Amortization Schedule */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Amortization Schedule
                  </h3>
                  <Button
                    onClick={downloadSchedule}
                    variant="secondary"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                          Month
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                          Payment
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                          Principal
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                          Interest
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.amortization_schedule.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                        >
                          <td className="py-2 px-2 text-gray-900 dark:text-white">{row.month}</td>
                          <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                            {row.payment.toLocaleString('en', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                            {row.principal.toLocaleString('en', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                            {row.interest.toLocaleString('en', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-gray-900 dark:text-white">
                            {row.balance.toLocaleString('en', { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}