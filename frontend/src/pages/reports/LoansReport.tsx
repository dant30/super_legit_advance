import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Download, Filter, RefreshCw } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import Loading from '@/components/shared/Loading'
import LoanStatusChart from '@/components/reports/Charts/LoanStatusChart'
import DateRangeFilter from '@/components/reports/Filters/DateRangeFilter'
import StatusFilter from '@/components/reports/Filters/StatusFilter'
import ExportButtons from '@/components/reports/Filters/ExportButtons'
import ReportTable from '@/components/reports/Tables/ReportTable'
import KpiCards from '@/components/reports/Metrics/KpiCards'

interface LoansReportData {
  loans: Array<{
    loan_number: string
    customer__first_name: string
    customer__last_name: string
    customer__customer_number: string
    loan_product__name: string
    amount_approved: number
    amount_disbursed: number
    outstanding_balance: number
    status: string
    disbursement_date: string
    due_date: string
    created_at: string
  }>
  summary: {
    total_loans: number
    total_approved: number
    total_outstanding: number
    status_distribution: Array<{
      status: string
      count: number
      amount: number
    }>
  }
}

const LoansReport = () => {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: 'all',
  })

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['loansReport', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.status !== 'all') params.append('status', filters.status)

      const response = await axiosInstance.get<LoansReportData>(
        `/reports/loans/?${params.toString()}`
      )
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await axiosInstance.post(
        format === 'excel' ? '/reports/export/excel/' : '/reports/export/pdf/',
        {
          data_type: 'loans',
          filters,
        },
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `loans_report_${new Date().toISOString().split('T')[0]}.${
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

  const kpis = [
    {
      label: 'Total Loans',
      value: reportData?.summary?.total_loans || 0,
      change: 12.5,
      trend: 'up',
    },
    {
      label: 'Total Approved',
      value: `KES ${((reportData?.summary?.total_approved || 0) / 1000000).toFixed(1)}M`,
      change: 8.2,
      trend: 'up',
    },
    {
      label: 'Outstanding Balance',
      value: `KES ${((reportData?.summary?.total_outstanding || 0) / 1000000).toFixed(1)}M`,
      change: -3.1,
      trend: 'down',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Loans Report | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loans Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive loan performance and status analysis
            </p>
          </div>
          <Button onClick={() => refetch()} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <KpiCards kpis={kpis} />

        {/* Filters */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DateRangeFilter
              startDate={filters.start_date}
              endDate={filters.end_date}
              onChange={(start, end) =>
                setFilters((prev) => ({ ...prev, start_date: start, end_date: end }))
              }
            />
            <StatusFilter
              value={filters.status}
              onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Disbursed', value: 'DISBURSED' },
                { label: 'Overdue', value: 'OVERDUE' },
              ]}
            />
            <ExportButtons
              onExport={handleExport}
              disabled={!reportData}
            />
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
            <LoanStatusChart
              data={reportData?.summary?.status_distribution || []}
            />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Summary Statistics</h3>
            <div className="space-y-3">
              {reportData?.summary?.status_distribution?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.status}</span>
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

        {/* Data Table */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Loan Details</h3>
          <ReportTable
            data={reportData?.loans || []}
            columns={[
              { key: 'loan_number', label: 'Loan Number' },
              { key: 'customer__first_name', label: 'Customer' },
              { key: 'loan_product__name', label: 'Product' },
              { key: 'amount_approved', label: 'Amount', format: 'currency' },
              { key: 'status', label: 'Status' },
              { key: 'due_date', label: 'Due Date', format: 'date' },
            ]}
          />
        </Card>
      </div>
    </>
  )
}

export default LoansReport