import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import Loading from '@/components/shared/Loading'
import CustomerGrowthChart from '@/components/reports/Charts/CustomerGrowthChart'
import CustomerFilter from '@/components/reports/Filters/CustomerFilter'
import ExportButtons from '@/components/reports/Filters/ExportButtons'
import ReportTable from '@/components/reports/Tables/ReportTable'
import KpiCards from '@/components/reports/Metrics/KpiCards'

interface CustomerReportData {
  customers: Array<{
    customer_number: string
    first_name: string
    last_name: string
    phone_number: string
    email: string
    county: string
    status: string
    risk_level: string
    credit_score: number
    registration_date: string
  }>
  summary: {
    total_customers: number
    active_customers: number
    customers_with_loans: number
    demographics: {
      gender: Array<{ gender: string; count: number }>
      county: Array<{ county: string; count: number }>
    }
  }
}

const CustomerReport = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    county: '',
    risk_level: '',
  })

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['customerReport', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.county) params.append('county', filters.county)
      if (filters.risk_level) params.append('risk_level', filters.risk_level)

      const response = await axiosInstance.get<CustomerReportData>(
        `/reports/customers/?${params.toString()}`
      )
      return response.data
    },
  })

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await axiosInstance.post(
        format === 'excel' ? '/reports/export/excel/' : '/reports/export/pdf/',
        {
          data_type: 'customers',
          filters,
        },
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `customers_report_${new Date().toISOString().split('T')[0]}.${
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
      label: 'Total Customers',
      value: reportData?.summary?.total_customers || 0,
      trend: 'up',
    },
    {
      label: 'Active Customers',
      value: reportData?.summary?.active_customers || 0,
      trend: 'up',
    },
    {
      label: 'With Loans',
      value: reportData?.summary?.customers_with_loans || 0,
      trend: 'up',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Customers Report | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Customer demographics and portfolio analysis
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
          <CustomerFilter
            filters={filters}
            onChange={setFilters}
          />
          <ExportButtons onExport={handleExport} disabled={!reportData} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Growth Trend</h3>
            <CustomerGrowthChart />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">County Distribution</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reportData?.summary?.demographics?.county?.map((item) => (
                <div key={item.county} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.county}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Details</h3>
          <ReportTable
            data={reportData?.customers || []}
            columns={[
              { key: 'customer_number', label: 'ID' },
              { key: 'first_name', label: 'Name' },
              { key: 'phone_number', label: 'Phone' },
              { key: 'county', label: 'County' },
              { key: 'status', label: 'Status' },
              { key: 'risk_level', label: 'Risk' },
              { key: 'credit_score', label: 'Credit Score' },
            ]}
          />
        </Card>
      </div>
    </>
  )
}

export default CustomerReport