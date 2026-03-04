// frontend/src/lib/utils/validators.ts
export const isEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())

export const isPhoneKE = (value = '') => /^(\+?254|0)?7\d{8}$/.test(String(value).replace(/\s+/g, ''))

export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const minLength = (value = '', length = 0) => String(value).length >= length

export const maxLength = (value = '', length = Number.MAX_SAFE_INTEGER) => String(value).length <= length

export const inRange = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return false
  return num >= min && num <= max
}

export function validate(schema = {}, payload = {}) {
  const errors = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = payload[field]
    const checks = Array.isArray(rules) ? rules : [rules]

    for (const rule of checks) {
      if (!rule?.test) continue
      const passed = rule.test(value, payload)
      if (!passed) {
        errors[field] = rule.message || 'Invalid value'
        break
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export default {
  isEmail,
  isPhoneKE,
  isRequired,
  minLength,
  maxLength,
  inRange,
  validate,
}
