import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  TrendingUp, DollarSign, Users, FileText, 
  BarChart3, PieChart, LineChart, Activity 
} from 'lucide-react'
import axiosInstance from '@/lib/axios'
import Loading from '@/components/shared/Loading'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  formats: string[]
}

const ReportOverview = () => {
  const { data: reportTypes, isLoading } = useQuery({
    queryKey: ['reportTypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/reports/')
      return response.data
    },
  })

  if (isLoading) {
    return <Loading />
  }

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'loans_summary',
      name: 'Loans Summary',
      description: 'Overview of all loans with status distribution',
      icon: <BarChart3 className="h-8 w-8" />,
      category: 'loans',
      formats: ['pdf', 'excel', 'json'],
    },
    {
      id: 'payments_detailed',
      name: 'Payments Report',
      description: 'Detailed payment transactions and trends',
      icon: <DollarSign className="h-8 w-8" />,
      category: 'payments',
      formats: ['pdf', 'excel'],
    },
    {
      id: 'customers_portfolio',
      name: 'Customers Portfolio',
      description: 'Customer demographics and loan history',
      icon: <Users className="h-8 w-8" />,
      category: 'customers',
      formats: ['pdf', 'excel'],
    },
    {
      id: 'performance_metrics',
      name: 'Performance Metrics',
      description: 'KPIs and performance indicators',
      icon: <TrendingUp className="h-8 w-8" />,
      category: 'analytics',
      formats: ['pdf', 'excel'],
    },
    {
      id: 'collection_report',
      name: 'Collection Report',
      description: 'Collections performance and overdue analysis',
      icon: <Activity className="h-8 w-8" />,
      category: 'collections',
      formats: ['pdf', 'excel'],
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment',
      description: 'Portfolio risk analysis',
      icon: <PieChart className="h-8 w-8" />,
      category: 'risk',
      formats: ['pdf', 'excel'],
    },
  ]

  return (
    <>
      <Helmet>
        <title>Reports | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate comprehensive reports on loans, payments, customers, and more
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {reportTypes?.length || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Formats</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">3</p>
                <p className="text-xs text-gray-500 mt-1">PDF, Excel, JSON</p>
              </div>
              <BarChart3 className="h-8 w-8 text-success-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Export Options</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">5+</p>
                <p className="text-xs text-gray-500 mt-1">Flexible exports</p>
              </div>
              <LineChart className="h-8 w-8 text-warning-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">6</p>
                <p className="text-xs text-gray-500 mt-1">Different types</p>
              </div>
              <PieChart className="h-8 w-8 text-danger-600" />
            </div>
          </Card>
        </div>

        {/* Report Categories */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((report) => (
              <Card key={report.id} className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="mb-4 text-primary-600">{report.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{report.description}</p>
                <div className="flex gap-2 mt-4">
                  {report.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded"
                    >
                      {fmt.toUpperCase()}
                    </span>
                  ))}
                </div>
                <Button className="w-full mt-4" size="sm">
                  Generate Report
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ReportOverview