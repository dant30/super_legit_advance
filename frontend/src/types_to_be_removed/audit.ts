// frontend/src/types/audit.ts
// Action types from backend
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'VERIFY'
  | 'BLACKLIST'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'PAYMENT'
  | 'REFUND'
  | 'NOTIFICATION'
  | 'REPORT'
  | 'BACKUP'
  | 'RESTORE'
  | 'SECURITY'
  | 'SYSTEM'
  | 'OTHER'

// Severity levels
export type AuditSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// Status types
export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'PENDING' | 'PARTIAL'

// Search type
export type AuditSearchType = 'user' | 'object' | 'ip' | 'changes' | 'all'

/**
 * Base Audit Log Interface - matches backend AuditLog model
 */
export interface AuditLog {
  id: string
  timestamp: string
  timestamp_display?: string

  // Action details
  action: AuditAction
  action_display: string
  severity: AuditSeverity
  severity_display: string
  status: AuditStatus
  status_display: string

  // User info
  user: {
    id: number
    name: string
    username?: string
    email?: string
  }
  user_display: string
  user_ip: string
  user_agent?: string
  user_agent_short?: string

  // Object info
  model_name: string
  object_id: string | null
  object_repr: string
  object_display: string

  // Changes and data
  changes: any
  changes_summary: string
  changes_parsed?: Record<string, any>
  previous_state?: any
  previous_state_parsed?: Record<string, any>
  new_state?: any
  new_state_parsed?: Record<string, any>

  // Request/Response info
  request_method: string
  request_path: string
  request_params?: any
  request_params_parsed?: Record<string, any>
  response_status: number

  // Session and metadata
  session_key?: string
  duration: number | null
  duration_display?: string
  module: string
  feature: string

  // Error info
  error_message: string
  error_traceback?: string

  // Compliance
  is_compliance_event: boolean
  compliance_id?: string

  // Additional metadata
  tags: string[]
  notes: string

  // Retention and archiving
  retention_days: number
  is_archived: boolean
  archive_date?: string

  // Related logs
  related_logs?: AuditLog[]
}

/**
 * Paginated response for audit logs
 */
export interface AuditLogListResponse {
  count: number
  next: string | null
  previous: string | null
  results: AuditLog[]
  summary?: AuditSummary
}

/**
 * Summary statistics
 */
export interface AuditSummary {
  total_logs: number
  success_logs: number
  failure_logs: number
  success_rate: number
  severity_distribution: Array<{
    severity: AuditSeverity
    count: number
  }>
  top_actions: Array<{
    action: string
    count: number
  }>
  top_users: Array<{
    user__username: string
    user__first_name: string
    user__last_name: string
    count: number
  }>
}

/**
 * Audit Statistics
 */
export interface AuditStats {
  time_period: {
    days: number
    start_date: string
    end_date: string
  }
  overall_statistics: {
    total_logs: number
    successful_logs: number
    failed_logs: number
    success_rate: number
  }
  activity_trends: {
    daily_activity: Array<{
      day: string
      count: number
      success: number
      failure: number
    }>
    hourly_activity: Array<{
      hour: string
      count: number
    }>
  }
  user_activity: {
    top_users: Array<{
      user__username: string
      user__first_name: string
      user__last_name: string
      user__email: string
      total_actions: number
      successful_actions: number
      failed_actions: number
      success_rate: number
    }>
    total_unique_users: number
  }
  system_activity: {
    active_models: Array<{
      model_name: string
      count: number
      last_activity: string
    }>
    common_actions: Array<{
      action: string
      count: number
    }>
    module_distribution: Array<{
      module: string
      count: number
    }>
  }
  security_metrics: {
    severity_distribution: Array<{
      severity: AuditSeverity
      count: number
    }>
    top_ip_addresses: Array<{
      user_ip: string
      count: number
    }>
    recent_security_events: AuditLog[]
    total_compliance_events: number
  }
  performance_metrics: {
    average_duration: number
    max_duration: number
  }
}

/**
 * User Activity
 */
export interface UserActivity {
  user_id: number
  time_period: {
    days: number
    start_date: string
    end_date: string
  }
  statistics: {
    total_actions: number
    successful_actions: number
    failed_actions: number
    success_rate: number
  }
  patterns: {
    common_actions: Array<{
      action: string
      count: number
    }>
    common_models: Array<{
      model_name: string
      count: number
    }>
    daily_pattern: Array<{
      hour: string
      count: number
    }>
  }
  recent_activity: AuditLog[]
}

/**
 * Security Event
 */
export interface SecurityEvent extends AuditLog {
  event_type:
    | 'LOGIN_ATTEMPT'
    | 'FAILED_LOGIN'
    | 'PASSWORD_CHANGE'
    | 'PERMISSION_CHANGE'
    | 'SUSPICIOUS_ACTIVITY'
  description: string
  severity: 'HIGH' | 'CRITICAL'
}

/**
 * Compliance Event
 */
export interface ComplianceEvent extends AuditLog {
  regulation: string
  requirement: string
  evidence: string
}

/**
 * Filter options
 */
export interface AuditFilterOptions {
  actions?: AuditAction[]
  severities?: AuditSeverity[]
  statuses?: AuditStatus[]
  models?: string[]
  modules?: string[]
  users?: Array<{ id: number; name: string }>
  dateRange?: {
    startDate: string
    endDate: string
  }
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'excel' | 'csv' | 'json'
  include_summary?: boolean
  filters?: Record<string, any>
}

/**
 * Audit API Error
 */
export interface AuditError {
  code: string
  message: string
  details?: Record<string, any>
}

/**
 * Activity Timeline Item
 */
export interface ActivityTimelineItem {
  id: string
  timestamp: string
  action: AuditAction
  severity: AuditSeverity
  user: string
  object: string
  description: string
  icon: string
  color: string
}

/**
 * Dashboard Metrics
 */
export interface AuditDashboardMetrics {
  total_actions_today: number
  failed_actions_today: number
  unique_users_today: number
  security_alerts_today: number
  top_models_today: Array<{ model: string; count: number }>
  recent_activity: AuditLog[]
}

/**
 * Activity Chart Data
 */
export interface ActivityChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
  }>
}