import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { RefreshCw, Target } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import Loading from '@/components/shared/Loading'
import CollectionPerformance from '@/components/reports/Charts/CollectionPerformance'
import DateRangeFilter from '@/components/reports/Filters/DateRangeFilter'
import StaffFilter from '@/components/reports/Filters/StaffFilter'
import ExportButtons from '@/components/reports/Filters/ExportButtons'
import ReportTable from '@/components/reports/Tables/ReportTable'
import KpiCards from '@/components/reports/Metrics/KpiCards'

interface CollectionReportData {
  summary: {
    total_overdue_loans: number
    total_overdue_amount: number
    portfolio_at_risk_percentage: number
    average_days_overdue: number
  }
  age_analysis: Array<{
    age_group: string
    count: number
    amount: number
  }>
  officer_performance: Array<{
    loan_officer__first_name: string
    loan_officer__last_name: string
    total_cases: number
    total_amount: number
  }>
  top_overdue_accounts: Array<{
    loan_number: string
    customer__first_name: string
    customer__last_name: string
    outstanding_balance: number
    days_overdue: number
  }>
}

const CollectionReport = () => {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    officer: '',
  })

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['collectionReport', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.officer) params.append('officer_id', filters.officer)

      const response = await axiosInstance.get<CollectionReportData>(
        `/reports/collection/?${params.toString()}`
      )
      return response.data
    },
  })

  if (isLoading) {
    return <Loading />
  }

  const kpis = [
    {
      label: 'Overdue Loans',
      value: reportData?.summary?.total_overdue_loans || 0,
      trend: 'down',
      icon: <Target className="h-6 w-6 text-danger-600" />,
    },
    {
      label: 'Overdue Amount',
      value: `KES ${((reportData?.summary?.total_overdue_amount || 0) / 1000000).toFixed(1)}M`,
      trend: 'down',
    },
    {
      label: 'At-Risk %',
      value: `${(reportData?.summary?.portfolio_at_risk_percentage || 0).toFixed(1)}%`,
      trend: 'down',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Collection Report | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collection Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Overdue loans and collection performance analysis
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
            <StaffFilter
              value={filters.officer}
              onChange={(officer) => setFilters((prev) => ({ ...prev, officer }))}
            />
            <ExportButtons onExport={() => {}} disabled={!reportData} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Collection Performance</h3>
            <CollectionPerformance />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Age Analysis</h3>
            <div className="space-y-3">
              {reportData?.age_analysis?.map((item) => (
                <div key={item.age_group} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.age_group}</span>
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
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Overdue Accounts</h3>
          <ReportTable
            data={reportData?.top_overdue_accounts || []}
            columns={[
              { key: 'loan_number', label: 'Loan #' },
              { key: 'customer__first_name', label: 'Customer' },
              { key: 'outstanding_balance', label: 'Amount', format: 'currency' },
              { key: 'days_overdue', label: 'Days Overdue' },
            ]}
          />
        </Card>
      </div>
    </>
  )
}

export default CollectionReport