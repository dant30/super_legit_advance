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

export interface Report {
  id: number
  name: string
  description: string
  type: ReportType
  category: 'loans' | 'payments' | 'customers' | 'analytics' | 'summary' | 'audit' | 'collections' | 'risk'
  formats: ReportFormat[]
  parameters: string[]
}

export interface ReportParameter {
  start_date?: string
  end_date?: string
  loan_status?: string
  loan_officer?: number
  customer_id?: number
  [key: string]: any
}

export interface ReportGenerationResponse {
  id: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  message: string
  report?: Report
  metadata?: {
    generated_at: string
    generated_by: string
    report_type: string
    parameters: any
  }
}

export interface ReportSchedule {
  id: number
  report_type: string
  schedule: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  format: ReportFormat
  parameters: any
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
  parameters: any
}