import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import Loading from '@/components/shared/Loading'
import DelinquencyHeatmap from '@/components/reports/Charts/DelinquencyHeatmap'
import DateRangeFilter from '@/components/reports/Filters/DateRangeFilter'
import ExportButtons from '@/components/reports/Filters/ExportButtons'
import ReportTable from '@/components/reports/Tables/ReportTable'
import KpiCards from '@/components/reports/Metrics/KpiCards'

const DelinquencyReport = () => {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
  })

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['delinquencyReport', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await axiosInstance.get(
        `/reports/audit/?${params.toString()}`
      )
      return response.data
    },
  })

  if (isLoading) {
    return <Loading />
  }

  const kpis = [
    {
      label: 'Delinquent Accounts',
      value: 247,
      trend: 'down',
      change: -5.2,
      icon: <AlertTriangle className="h-6 w-6 text-danger-600" />,
    },
    {
      label: 'Total Outstanding',
      value: 'KES 45.2M',
      trend: 'down',
      change: -3.1,
    },
    {
      label: 'Delinquency Rate',
      value: '12.5%',
      trend: 'down',
      change: -1.2,
    },
  ]

  return (
    <>
      <Helmet>
        <title>Delinquency Report | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Delinquency Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Delinquent loan analysis and overdue tracking
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
            <ExportButtons onExport={() => {}} disabled={!reportData} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delinquency Calendar</h3>
          <DelinquencyHeatmap />
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delinquent Loans</h3>
          <ReportTable
            data={[]}
            columns={[
              { key: 'loan_number', label: 'Loan #' },
              { key: 'customer__first_name', label: 'Customer' },
              { key: 'outstanding_balance', label: 'Amount', format: 'currency' },
              { key: 'days_overdue', label: 'Days Overdue' },
              { key: 'last_payment_date', label: 'Last Payment', format: 'date' },
            ]}
          />
        </Card>
      </div>
    </>
  )
}

export default DelinquencyReport