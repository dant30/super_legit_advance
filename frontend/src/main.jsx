// fronten/src/main.jsx doing only jsx, js and i have deleted types and slices
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import ErrorFallback from '@components/shared/ErrorBoundary'
import { AuthProvider } from '@contexts/AuthContext'
import { ToastProvider } from '@contexts/ToastContext' // <-- Updated import
import '@styles/tailwind.css'

// ======================================================
// HMR-safe QueryClient
// ======================================================
let queryClient

const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (import.meta.env.DEV) console.error('[React Query Error]', error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })

if (import.meta.hot) {
  queryClient = import.meta.hot.data.queryClient || createQueryClient()
  import.meta.hot.data.queryClient = queryClient
} else {
  queryClient = createQueryClient()
}

// ======================================================
// Global Error Capture
// ======================================================
if (typeof window !== 'undefined') {
  const handleUnhandledRejection = (e) => {
    console.error('[Unhandled Promise Rejection]', e.reason)
  }

  const handleGlobalError = (e) => {
    console.error('[Global Error]', e.error || e.message)
  }

  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('error', handleGlobalError)

  import.meta.hot?.dispose(() => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('error', handleGlobalError)
  })
}

// ======================================================
// Providers
// ======================================================
const Providers = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error, info) => {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }}
    onReset={() => window.location.reload()}
  >
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ToastProvider> {/* <-- New ToastProvider placement */}
          <AuthProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </HelmetProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </ErrorBoundary>
)

// ======================================================
// Render Application
// ======================================================
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
)

// ======================================================
// Development-only Enhancements
// ======================================================
if (import.meta.env.DEV) {
  console.info('React Query DevTools enabled in development')
  console.info(`Environment: ${import.meta.env.MODE}`)
  console.info(`API URL: ${import.meta.env.VITE_API_URL}`)
}

