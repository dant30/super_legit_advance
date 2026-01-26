/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_MAX_RETRIES: string
  
  // Application Settings
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENVIRONMENT: 'development' | 'production' | 'staging'
  readonly VITE_APP_DEFAULT_LANGUAGE: string
  readonly VITE_APP_DEFAULT_CURRENCY: string
  readonly VITE_APP_DEFAULT_TIMEZONE: string
  
  // Authentication
  readonly VITE_AUTH_TOKEN_KEY: string
  readonly VITE_AUTH_REFRESH_TOKEN_KEY: string
  readonly VITE_AUTH_TOKEN_EXPIRY: string
  readonly VITE_AUTH_REFRESH_TOKEN_EXPIRY: string
  
  // Features Flags
  readonly VITE_FEATURE_LOAN_CALCULATOR: string
  readonly VITE_FEATURE_MPESA_INTEGRATION: string
  readonly VITE_FEATURE_SMS_NOTIFICATIONS: string
  readonly VITE_FEATURE_REPORT_EXPORT: string
  readonly VITE_FEATURE_BULK_IMPORT: string
  readonly VITE_FEATURE_AUDIT_LOGS: string
  
  // External Services
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  
  // M-Pesa Integration
  readonly VITE_MPESA_ENVIRONMENT: 'sandbox' | 'production'
  readonly VITE_MPESA_CONSUMER_KEY: string
  readonly VITE_MPESA_CONSUMER_SECRET: string
  readonly VITE_MPESA_SHORTCODE: string
  readonly VITE_MPESA_PASSKEY: string
  
  // SMS Integration
  readonly VITE_AFRICASTALKING_USERNAME: string
  readonly VITE_AFRICASTALKING_API_KEY: string
  
  // File Upload
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_ALLOWED_FILE_TYPES: string
  
  // Performance
  readonly VITE_ENABLE_CACHE: string
  readonly VITE_CACHE_DURATION: string
  readonly VITE_ENABLE_COMPRESSION: string
  
  // Development
  readonly VITE_ENABLE_MOCK_API: string
  readonly VITE_MOCK_API_DELAY: string
  
  // Security
  readonly VITE_ENABLE_SSL_STRICT: string
  readonly VITE_ENABLE_CSP: string
  readonly VITE_ENABLE_HSTS: string
  
  // Monitoring
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string
  readonly VITE_ENABLE_ERROR_TRACKING: string
  
  // Internationalization
  readonly VITE_SUPPORTED_LANGUAGES: string
  readonly VITE_DEFAULT_LANGUAGE: string
  readonly VITE_ENABLE_RTL: string
  
  // Theme
  readonly VITE_DEFAULT_THEME: 'light' | 'dark'
  readonly VITE_ENABLE_DARK_MODE: string
  readonly VITE_THEME_COLORS: string
  
  // PWA
  readonly VITE_ENABLE_PWA: string
  readonly VITE_PWA_NAME: string
  readonly VITE_PWA_SHORT_NAME: string
  readonly VITE_PWA_THEME_COLOR: string
  readonly VITE_PWA_BACKGROUND_COLOR: string
  
  // Testing
  readonly VITE_ENABLE_TEST_MODE: string
  readonly VITE_TEST_USERNAME: string
  readonly VITE_TEST_PASSWORD: string
  
  // Analytics
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ANALYTICS_ID: string
  
  // Payment Gateway
  readonly VITE_PAYMENT_GATEWAY_URL: string
  readonly VITE_PAYMENT_CALLBACK_URL: string
  
  // Loan Settings
  readonly VITE_MAX_LOAN_AMOUNT: string
  readonly VITE_MIN_LOAN_AMOUNT: string
  readonly VITE_MAX_LOAN_PERIOD: string
  readonly VITE_MIN_LOAN_PERIOD: string
  readonly VITE_INTEREST_RATE: string
  readonly VITE_LATE_PAYMENT_PENALTY: string
  
  // Customer Settings
  readonly VITE_MIN_CUSTOMER_AGE: string
  readonly VITE_MAX_GUARANTORS: string
  readonly VITE_CREDIT_SCORE_THRESHOLD_LOW: string
  readonly VITE_CREDIT_SCORE_THRESHOLD_MEDIUM: string
  readonly VITE_CREDIT_SCORE_THRESHOLD_HIGH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// TypeScript support for Vite's import.meta.glob
declare module '*.svg' {
  import React from 'react'
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

declare module '*.gif' {
  const value: string
  export default value
}

declare module '*.webp' {
  const value: string
  export default value
}

declare module '*.ico' {
  const value: string
  export default value
}

declare module '*.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.sass' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.less' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.styl' {
  const classes: { [key: string]: string }
  export default classes
}

// Web Workers
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

declare module '*?worker&url' {
  const src: string
  export default src
}

// Web Assembly
declare module '*.wasm?init' {
  const init: (options?: WebAssembly.Imports) => Promise<WebAssembly.Instance>
  export default init
}

// Custom element definitions
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

// Global window extensions
interface Window {
  // Google Analytics
  gtag?: (command: string, ...args: any[]) => void
  dataLayer?: any[]
  
  // Sentry
  Sentry?: any
  
  // Performance API extensions
  performance: Performance & {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
  
  // Service Worker
  serviceWorker?: ServiceWorkerContainer
  
  // Custom properties
  __SLA_ENV__?: {
    version: string
    environment: string
    buildDate: string
  }
  
  // Debug utilities
  debug?: {
    enable: () => void
    disable: () => void
    log: (...args: any[]) => void
  }
}

// Global document extensions
interface Document {
  // MS-specific extensions
  msHidden?: boolean
  webkitHidden?: boolean
}

// Navigator extensions
interface Navigator {
  // Device memory API
  deviceMemory?: number
  
  // Connection API
  connection?: {
    effectiveType: string
    saveData: boolean
    downlink: number
    rtt: number
  }
  
  // Storage API
  storage?: {
    estimate: () => Promise<{
      quota: number
      usage: number
      usageDetails?: { [key: string]: number }
    }>
    persist: () => Promise<boolean>
    persisted: () => Promise<boolean>
  }
}

// Performance extensions
interface PerformanceEntry {
  // LCP-specific properties
  element?: Element
  url?: string
  loadTime?: number
  renderTime?: number
  
  // CLS-specific properties
  value?: number
  attribution?: Array<{
    node?: Node
    previousRect?: DOMRectReadOnly
    currentRect?: DOMRectReadOnly
  }>
}

// Service Worker types
interface ServiceWorkerRegistration {
  // Background sync
  sync?: {
    register: (tag: string) => Promise<void>
    getTags: () => Promise<string[]>
  }
  
  // Periodic sync
  periodicSync?: {
    register: (tag: string, options: { minInterval: number }) => Promise<void>
    unregister: (tag: string) => Promise<void>
    getTags: () => Promise<string[]>
  }
}

// Custom events
interface CustomEventMap {
  'theme-change': CustomEvent<{ theme: 'light' | 'dark' }>
  'auth-change': CustomEvent<{ isAuthenticated: boolean; user?: any }>
  'notification': CustomEvent<{ title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>
  'offline': CustomEvent
  'online': CustomEvent
  'storage': CustomEvent<{ key: string; value: any }>
}

declare global {
  interface WindowEventMap extends CustomEventMap {}
  interface DocumentEventMap extends CustomEventMap {}
}

// Utility types for the application
type Nullable<T> = T | null
type Optional<T> = T | undefined
type RecordString<T> = Record<string, T>
type RecordNumber<T> = Record<number, T>

// API response types
interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
  success: boolean
  timestamp: string
  pagination?: {
    page: number
    page_size: number
    total: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

interface ApiError {
  message: string
  status: number
  errors?: RecordString<string[]>
  timestamp: string
  path: string
}

// User types
interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  role: 'admin' | 'staff' | 'manager' | 'customer'
  is_active: boolean
  last_login: string
  date_joined: string
  permissions: string[]
}

interface AuthTokens {
  access: string
  refresh: string
  access_expires: string
  refresh_expires: string
}

// Export for global use
export {}