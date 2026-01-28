import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Download, RefreshCw } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import Loading from '@/components/shared/Loading'
import RepaymentTrends from '@/components/reports/Charts/RepaymentTrends'
import DateRangeFilter from '@/components/reports/Filters/DateRangeFilter'
import ExportButtons from '@/components/reports/Filters/ExportButtons'
import ReportTable from '@/components/reports/Tables/ReportTable'
import KpiCards from '@/components/reports/Metrics/KpiCards'

interface PaymentsReportData {
  payments: Array<{
    payment_reference: string
    loan__loan_number: string
    loan__customer__first_name: string
    loan__customer__last_name: string
    amount: number
    payment_method: string
    status: string
    payment_date: string
    created_at: string
  }>
  summary: {
    total_payments: number
    total_amount: number
    successful_payments: number
    method_distribution: Array<{
      payment_method: string
      count: number
      amount: number
    }>
  }
}

const PaymentsReport = () => {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
  })

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['paymentsReport', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await axiosInstance.get<PaymentsReportData>(
        `/reports/payments/?${params.toString()}`
      )
      return response.data
    },
  })

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await axiosInstance.post(
        format === 'excel' ? '/reports/export/excel/' : '/reports/export/pdf/',
        {
          data_type: 'payments',
          filters,
        },
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `payments_report_${new Date().toISOString().split('T')[0]}.${
        format === 'excel' ? 'xlsx' : 'pdf'
      }`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  const successRate =
    reportData?.summary?.total_payments > 0
      ? (reportData.summary.successful_payments / reportData.summary.total_payments) * 100
      : 0

  const kpis = [
    {
      label: 'Total Payments',
      value: reportData?.summary?.total_payments || 0,
      trend: 'up',
    },
    {
      label: 'Total Amount',
      value: `KES ${((reportData?.summary?.total_amount || 0) / 1000000).toFixed(1)}M`,
      trend: 'up',
    },
    {
      label: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      trend: successRate > 80 ? 'up' : 'down',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Payments Report | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Payment collections and transaction analysis
            </p>
          </div>
          <Button onClick={() => refetch()} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <KpiCards kpis={kpis} />

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="flex gap-4">
            <DateRangeFilter
              startDate={filters.start_date}
              endDate={filters.end_date}
              onChange={(start, end) =>
                setFilters((prev) => ({ ...prev, start_date: start, end_date: end }))
              }
            />
            <ExportButtons onExport={handleExport} disabled={!reportData} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Trends</h3>
            <RepaymentTrends />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Method Distribution</h3>
            <div className="space-y-3">
              {reportData?.summary?.method_distribution?.map((item) => (
                <div key={item.payment_method} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.payment_method}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.count}</p>
                    <p className="text-xs text-gray-500">
                      KES {(item.amount / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h3>
          <ReportTable
            data={reportData?.payments || []}
            columns={[
              { key: 'payment_reference', label: 'Reference' },
              { key: 'loan__loan_number', label: 'Loan' },
              { key: 'loan__customer__first_name', label: 'Customer' },
              { key: 'amount', label: 'Amount', format: 'currency' },
              { key: 'payment_method', label: 'Method' },
              { key: 'status', label: 'Status' },
              { key: 'payment_date', label: 'Date', format: 'date' },
            ]}
          />
        </Card>
      </div>
    </>
  )
}

export default PaymentsReport