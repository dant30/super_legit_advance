// fronten/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { store } from '@/store/store'
import { ErrorFallback } from '@/components/shared/Error' // <-- Changed import
import { ToastProvider } from '@/components/ui/Toast/ToastProvider'
import '@styles/tailwind.css'

// ======================================================
// HMR-safe QueryClient
// ======================================================
let queryClient: QueryClient

if (import.meta.hot) {
  queryClient = import.meta.hot.data.queryClient || new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (import.meta.env.DEV) {
          console.error('[React Query Error]', error)
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })
  
  import.meta.hot.data.queryClient = queryClient
} else {
  queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (import.meta.env.DEV) {
          console.error('[React Query Error]', error)
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

export { queryClient }

// ======================================================
// Global Error Capture
// ======================================================
if (typeof window !== 'undefined') {
  const onUnhandledRejection = (e: PromiseRejectionEvent) => {
    console.error('[Unhandled Promise Rejection]', e.reason)
  }

  const onGlobalError = (e: ErrorEvent) => {
    console.error('[Global Error]', e.error || e.message)
  }

  window.addEventListener('unhandledrejection', onUnhandledRejection)
  window.addEventListener('error', onGlobalError)

  import.meta.hot?.dispose(() => {
    window.removeEventListener('unhandledrejection', onUnhandledRejection)
    window.removeEventListener('error', onGlobalError)
  })
}

// Add React Query DevTools to window for debugging
declare global {
  interface Window {
    __REACT_QUERY_DEVTOOLS__?: typeof ReactQueryDevtools
  }
}

// ======================================================
// Providers
// ======================================================
const Providers: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback} // <-- Use the new wrapper
    onError={(error, info) => {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }}
    onReset={() => window.location.reload()}
  >
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ToastProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </ToastProvider>
        </HelmetProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  </ErrorBoundary>
)

// ======================================================
// Render Application
// ======================================================
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
)

// ======================================================
// Development-only enhancements
// ======================================================
if (import.meta.env.DEV) {
  // Add React Query DevTools to window for debugging
  window.__REACT_QUERY_DEVTOOLS__ = ReactQueryDevtools
  
  // Enable React Query DevTools by default in development
  console.info('React Query DevTools enabled in development')
  
  // Log environment info
  console.info(`Environment: ${import.meta.env.MODE}`)
  console.info(`API URL: ${import.meta.env.VITE_API_URL}`)
}