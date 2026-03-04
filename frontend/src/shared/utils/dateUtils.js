import { APP_DEFAULTS } from './constants'

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toISODate(value) {
  const date = toDate(value)
  return date ? date.toISOString() : null
}

export function formatDate(value, locale = APP_DEFAULTS.locale, options = {}) {
  const date = toDate(value)
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...options,
  }).format(date);
}

export function formatDateTime(value, locale = APP_DEFAULTS.locale, options = {}) {
  const date = toDate(value)
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
}

export function isPast(value) {
  const date = toDate(value)
  if (!date) return false
  return date.getTime() < Date.now();
}

export function daysUntil(value) {
  const date = toDate(value)
  if (!date) return null
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}
