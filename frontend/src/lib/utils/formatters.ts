// frontend/src/lib/utils/formatters.ts

/**
 * Format a phone number to a standard international format.
 * Ensures numbers start with +254 (Kenya country code)
 */
export const formatPhoneNumber = (phone: string): string => {
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
 */
export const formatCurrency = (amount: number, currency = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

/**
 * Format a date into a human-readable string.
 * Handles both Date objects and string representations of dates.
 */
export const formatDate = (date: string | Date | null | undefined): string => {
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
 * Optional: Simple display formatter for numbers with commas (non-currency)
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '0'
  return value.toLocaleString('en-KE')
}
