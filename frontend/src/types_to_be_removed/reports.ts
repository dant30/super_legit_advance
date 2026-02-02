// frontend/src/types/reports.ts

export type ReportType =
  | 'loans_summary'
  | 'payments_detailed'
  | 'customers_portfolio'
  | 'performance_metrics'
  | 'daily_summary'
  | 'monthly_summary'
  | 'audit_trail'
  | 'collection_report'
  | 'risk_assessment'

export type ReportFormat = 'pdf' | 'excel' | 'json'

export type ReportCategory =
  | 'loans'
  | 'payments'
  | 'customers'
  | 'analytics'
  | 'summary'
  | 'audit'
  | 'collections'
  | 'risk'

export interface Report {
  id: number
  name: string
  description: string
  type: ReportType
  category: ReportCategory
  formats: ReportFormat[]
  parameters: string[]
}

export interface ReportParameter {
  start_date?: string
  end_date?: string
  loan_status?: string
  loan_officer?: number
  customer_id?: number
  payment_method?: string
  status?: string
  customer_status?: string
  county?: string
  risk_level?: string
  has_loans?: boolean
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  metric_type?: 'all' | 'loans' | 'payments' | 'collections' | 'risk'
  month?: number
  year?: number
  date?: string
  user_id?: number
  action_type?: string
  officer_id?: number
  assessment_date?: string
  [key: string]: any
}

export interface ReportGenerationRequest {
  report_type: ReportType
  format: ReportFormat
  parameters?: ReportParameter
}

export interface ReportGenerationResponse {
  id?: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  message: string
  report?: Report
  file_url?: string
  file_size?: number
  generated_at?: string
  generated_by?: string
  metadata?: {
    generated_at: string
    generated_by: string
    report_type: string
    parameters: ReportParameter
  }
}

export interface ReportSchedule {
  id: number
  report_type: ReportType
  schedule: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  format: ReportFormat
  parameters: ReportParameter
  next_run: string
  created_at: string
  created_by: string
  is_active: boolean
}

export interface ReportHistory {
  id: number
  report_type: string
  generated_by: string
  generated_at: string
  format: string
  file_size: string
  download_url: string
  parameters: ReportParameter
}

export interface ReportExportRequest {
  data_type: 'loans' | 'payments' | 'customers'
  filters?: {
    start_date?: string
    end_date?: string
    status?: string
    method?: string
    county?: string
    risk_level?: string
    [key: string]: any
  }
  include_charts?: boolean
}

export interface ReportSummary {
  total_loans?: number
  total_amount?: number
  total_disbursed?: number
  total_outstanding?: number
  average_loan_amount?: number
  total_payments?: number
  successful_payments?: number
  failed_payments?: number
  success_rate?: number
  total_customers?: number
  active_customers?: number
  blacklisted_customers?: number
  customers_with_loans?: number
  [key: string]: any
}

export interface ReportMetrics {
  loan_metrics?: Array<{
    period: string
    loans_approved: number
    loans_disbursed: number
    total_approved: number
    total_disbursed: number
    avg_loan_size: number
  }>
  payment_metrics?: Array<{
    period: string
    total_payments: number
    total_collected: number
    avg_payment: number
  }>
  collection_metrics?: Array<{
    period: string
    portfolio_at_risk: number
    collection_rate: number
  }>
  risk_metrics?: Array<{
    period: string
    total_customers: number
    high_risk_customers: number
    avg_credit_score: number
  }>
}

export interface ReportKPIs {
  loan_approval_rate?: number
  loan_disbursement_rate?: number
  collection_efficiency?: number
  portfolio_at_risk?: number
  customer_satisfaction?: number
  operational_efficiency?: {
    loans_per_staff?: number
    processing_time_days?: number
    cost_per_loan?: number
  }
  [key: string]: any
}

export interface ReportDistribution {
  status?: string
  payment_method?: string
  gender?: string
  county?: string
  risk_level?: string
  count: number
  amount?: number
  percentage?: number
}

export interface ReportTrend {
  period: string
  month?: string
  count: number
  amount?: number
  date?: string
}

export interface ReportDetail {
  title: string
  period?: string
  date_range?: {
    start: string
    end: string
  }
  month?: string
  summary: ReportSummary
  status_distribution?: ReportDistribution[]
  method_distribution?: ReportDistribution[]
  demographics?: {
    gender_distribution: ReportDistribution[]
    county_distribution: ReportDistribution[]
    age_groups?: ReportDistribution[]
  }
  daily_trend?: ReportTrend[]
  top_customers?: Array<{ [key: string]: any }>
  top_loans?: Array<{ [key: string]: any }>
  top_payments?: Array<{ [key: string]: any }>
  loans?: Array<{ [key: string]: any }>
  payments?: Array<{ [key: string]: any }>
  customers?: Array<{ [key: string]: any }>
  key_performance_indicators?: ReportKPIs
  trends?: {
    loan_trend: ReportTrend[]
    payment_trend: ReportTrend[]
    customer_trend: ReportTrend[]
  }
  officer_performance?: Array<{ [key: string]: any }>
  product_distribution?: Array<{ [key: string]: any }>
  metadata?: {
    generated_at: string
    generated_by: string
    report_type: string
    parameters: ReportParameter
  }
  [key: string]: any
}

export interface ReportState {
  reports: Report[]
  currentReport: ReportDetail | null
  reportHistory: ReportHistory[]
  loading: boolean
  generating: boolean
  exporting: boolean
  error: string | null
  success: string | null
  filterParams: ReportParameter
  selectedFormat: ReportFormat
  generationProgress: number
  schedules: ReportSchedule[]
}