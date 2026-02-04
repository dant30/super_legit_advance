// src/utils/env.js
// --------------------------------------------------
// Centralized environment configuration (Vite)
// --------------------------------------------------

/**
 * Required environment variables.
 * App should HARD FAIL if these are missing.
 */
const REQUIRED_VARS = [
  'VITE_API_URL',
  'VITE_APP_ENVIRONMENT',
]

REQUIRED_VARS.forEach((key) => {
  if (!import.meta.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`)
  }
})

/**
 * Normalized environment object.
 * All coercion happens ONCE, here.
 */
export const ENV = {
  // Core
  API_URL: import.meta.env.VITE_API_URL,
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT,

  // Optional / derived
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Super Legit Advance',

  // Feature flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
}

/**
 * Environment helpers
 * (Readable intent > string comparisons everywhere)
 */
export const isDevelopment = () => ENV.ENVIRONMENT === 'development'
export const isStaging = () => ENV.ENVIRONMENT === 'staging'
export const isProduction = () => ENV.ENVIRONMENT === 'production'