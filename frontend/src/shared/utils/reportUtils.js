// frontend/src/lib/utils/reportUtils.js

/**
 * Download blob as file
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get report type display name
 */
export const getReportTypeDisplay = (type) => {
  const displayNames = {
    'loans_summary': 'Loans Summary',
    'payments_detailed': 'Payments Detailed',
    'customers_portfolio': 'Customers Portfolio',
    'performance_metrics': 'Performance Metrics',
    'daily_summary': 'Daily Summary',
    'monthly_summary': 'Monthly Summary',
    'audit_trail': 'Audit Trail',
    'collection_report': 'Collection Report',
    'risk_assessment': 'Risk Assessment',
  }
  return displayNames[type] || type.replace(/_/g, ' ').toUpperCase()
}

/**
 * Get report category color
 */
export const getReportCategoryColor = (category) => {
  const colors = {
    'loans': 'bg-blue-100 text-blue-800',
    'payments': 'bg-green-100 text-green-800',
    'customers': 'bg-purple-100 text-purple-800',
    'analytics': 'bg-yellow-100 text-yellow-800',
    'summary': 'bg-indigo-100 text-indigo-800',
    'audit': 'bg-gray-100 text-gray-800',
    'collections': 'bg-red-100 text-red-800',
    'risk': 'bg-orange-100 text-orange-800',
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

/**
 * Generate default date range for reports
 */
export const getDefaultDateRange = (range = 'month') => {
  const today = new Date()
  const startDate = new Date()
  
  switch (range) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(today.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(today.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(today.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(today.getFullYear() - 1)
      break
  }
  
  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: today.toISOString().split('T')[0],
  }
}

/**
 * Validate report parameters
 */
export const validateReportParameters = (reportType, parameters) => {
  const errors = []
  
  // Check required parameters based on report type
  switch (reportType) {
    case 'loans_summary':
    case 'payments_detailed':
    case 'audit_trail':
    case 'collection_report':
      if (!parameters.start_date) {
        errors.push('Start date is required')
      }
      if (!parameters.end_date) {
        errors.push('End date is required')
      }
      break
    case 'monthly_summary':
      if (!parameters.month || !parameters.year) {
        errors.push('Month and year are required')
      }
      break
  }
  
  // Validate date range
  if (parameters.start_date && parameters.end_date) {
    const start = new Date(parameters.start_date)
    const end = new Date(parameters.end_date)
    
    if (start > end) {
      errors.push('Start date cannot be after end date')
    }
    
    // Limit date range to 2 years for performance
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    
    if (start < twoYearsAgo) {
      errors.push('Date range cannot be more than 2 years')
    }
  }
  
  return errors
}

// Optional: Add more utility functions for report generation

/**
 * Get report file extension based on format
 */
export const getReportFileExtension = (format) => {
  const extensions = {
    'excel': '.xlsx',
    'csv': '.csv',
    'pdf': '.pdf',
    'json': '.json',
  }
  return extensions[format] || '.txt'
}

/**
 * Generate report filename with timestamp
 */
export const generateReportFilename = (reportType, format) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const extension = getReportFileExtension(format)
  return `${reportType}_${timestamp}${extension}`
}

/**
 * Debounce function for report generation
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Sanitize report parameters for API request
 */
export const sanitizeReportParams = (params) => {
  const sanitized = {}
  
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      sanitized[key] = params[key]
    }
  }
  
  return sanitized
}