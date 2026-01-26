import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { RefreshCw, TrendingUp } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import Loading from '@/components/shared/Loading'
import LoanStatusChart from '@/components/reports/Charts/LoanStatusChart'
import RepaymentTrends from '@/components/reports/Charts/RepaymentTrends'
import StaffFilter from '@/components/reports/Filters/StaffFilter'
import ExportButtons from '@/components/reports/Filters/ExportButtons'
import KpiCards from '@/components/reports/Metrics/KpiCards'
import ComparisonChart from '@/components/reports/Metrics/ComparisonChart'
import SummaryTable from '@/components/reports/Tables/SummaryTable'

const PerformanceReport = () => {
  const [filters, setFilters] = useState({
    period: 'monthly',
    staff: '',
  })

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['performanceReport', filters],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/reports/performance/?period=${filters.period}`
      )
      return response.data
    },
  })

  if (isLoading) {
    return <Loading />
  }

  const kpis = [
    {
      label: 'Approval Rate',
      value: '85.5%',
      trend: 'up',
      change: 4.2,
      icon: <TrendingUp className="h-6 w-6 text-success-600" />,
    },
    {
      label: 'Disbursement Rate',
      value: '78.3%',
      trend: 'up',
      change: 2.8,
    },
    {
      label: 'Collection Efficiency',
      value: '92.1%',
      trend: 'up',
      change: 5.6,
    },
    {
      label: 'Customer Satisfaction',
      value: '4.5/5',
      trend: 'up',
      change: 0.3,
    },
  ]

  return (
    <>
      <Helmet>
        <title>Performance Report | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Key performance indicators and metrics analysis
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
            <select
              value={filters.period}
              onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <StaffFilter
              value={filters.staff}
              onChange={(staff) => setFilters((prev) => ({ ...prev, staff }))}
            />
            <ExportButtons onExport={() => {}} disabled={!reportData} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Loan Metrics</h3>
            <LoanStatusChart data={[]} />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Collection Trends</h3>
            <RepaymentTrends />
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Year-over-Year Comparison</h3>
          <ComparisonChart />
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
          <SummaryTable data={[]} columns={[]} />
        </Card>
      </div>
    </>
  )
}

export default PerformanceReport