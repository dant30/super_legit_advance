/// <reference types="vite/client" />

export {}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_ENVIRONMENT: 'development' | 'staging' | 'production'
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_GOOGLE_ANALYTICS_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
