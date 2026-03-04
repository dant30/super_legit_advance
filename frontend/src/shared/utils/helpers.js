export const isNil = (value) => value === null || value === undefined

export const noop = () => {}

export const sleep = (ms = 0) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const toNumber = (value, fallback = 0) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

export const safeArray = (value) => (Array.isArray(value) ? value : [])

export const safeObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

export function pick(obj = {}, keys = []) {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

export function omit(obj = {}, keys = []) {
  const blacklist = new Set(keys)
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (!blacklist.has(key)) acc[key] = value
    return acc
  }, {})
}

export default {
  isNil,
  noop,
  sleep,
  clamp,
  toNumber,
  safeArray,
  safeObject,
  pick,
  omit,
}
