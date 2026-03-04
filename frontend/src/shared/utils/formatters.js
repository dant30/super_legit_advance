// frontend/src/utils/formatters.js

/**
 * Format a phone number to a standard international format.
 * Ensures numbers start with +254 (Kenya country code)
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Handle different possible cases
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Local number like 0712345678 -> +254712345678
    return '+254' + cleaned.substring(1)
  }
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    // Already country code without + -> +254712345678
    return '+' + cleaned
  }
  if (cleaned.length === 9) {
    // Number without leading 0 -> +254712345678
    return '+254' + cleaned
  }
  
  // If already in proper format or unrecognized, return cleaned with plus if missing
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned
}

/**
 * Format a number as currency in Kenyan Shillings (KES) or any other currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'KES')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES') => {
  // Handle null/undefined/NaN
  const safeAmount = Number(amount) || 0
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeAmount)
}

/**
 * Format a date into a human-readable string.
 * Handles both Date objects and string representations of dates.
 * @param {string|Date|null|undefined} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A'

  const d = date instanceof Date ? date : new Date(date)
  
  if (isNaN(d.getTime())) return 'Invalid Date'

  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Simple display formatter for numbers with commas (non-currency)
 * @param {number|null|undefined} value - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  if (value == null) return '0'
  
  const num = Number(value)
  if (isNaN(num)) return '0'
  
  return num.toLocaleString('en-KE')
}

/**
 * Format date and time together
 * @param {string|Date|null|undefined} dateTime - The date/time to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A'

  const d = dateTime instanceof Date ? dateTime : new Date(dateTime)
  
  if (isNaN(d.getTime())) return 'Invalid Date/Time'

  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - The date to calculate relative time from
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'

  const d = date instanceof Date ? date : new Date(date)
  
  if (isNaN(d.getTime())) return 'Invalid Date'

  const now = new Date()
  const diffInSeconds = Math.floor((now - d) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  
  return formatDate(d)
}

/**
 * Format file size from bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Truncate text with ellipsis if too long
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format percentage with proper rounding
 * @param {number} value - The decimal value (0-1) or percentage
 * @param {boolean} isDecimal - Whether the value is a decimal (0-1) or already percentage
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, isDecimal = true) => {
  const num = Number(value) || 0
  const percentage = isDecimal ? num * 100 : num
  
  // Round to 2 decimal places
  return `${percentage.toFixed(2)}%`
}

/**
 * Format Kenyan ID number (add dashes for readability)
 * @param {string} idNumber - The ID number
 * @returns {string} Formatted ID number
 */
export const formatIdNumber = (idNumber) => {
  if (!idNumber) return ''
  
  // Remove any non-digit characters
  const cleaned = idNumber.replace(/\D/g, '')
  
  if (cleaned.length === 8) {
    // Format as XXXXXXXX
    return cleaned
  }
  
  return cleaned
}

/**
 * Format a duration in milliseconds to readable time
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  
  return `${seconds}s`
}