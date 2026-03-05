const REQUIRED_VARS = ['VITE_API_URL']

REQUIRED_VARS.forEach((key) => {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL,
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || import.meta.env.MODE || 'production',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Super Legit Advance',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
}

export const getEnv = (key, fallback = undefined) => import.meta.env[key] ?? fallback
export const isDevelopment = () => ENV.ENVIRONMENT === 'development'
export const isStaging = () => ENV.ENVIRONMENT === 'staging'
export const isProduction = () => ENV.ENVIRONMENT === 'production'

export default ENV