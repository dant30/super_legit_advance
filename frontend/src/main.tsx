// fronten/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'

/* -----------------------------
   Core Providers
-------------------------------- */
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

/* -----------------------------
   React Query
-------------------------------- */
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/* -----------------------------
   Error Handling & Meta
-------------------------------- */
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'

/* -----------------------------
   Notifications
-------------------------------- */
import { Toaster, ToastOptions } from 'react-hot-toast'
import ToastProvider from '@/components/ui/Toast/ToastProvider'

/* -----------------------------
   App & Store
-------------------------------- */
import App from './App'
import { store } from '@/store/store'
import { Error as ErrorFallback } from '@/components/shared/Error'

/* -----------------------------
   Global Styles (ORDER MATTERS)
-------------------------------- */
import '@styles/tailwind.css'

/* ======================================================
   React Query Client (HMR-safe)
====================================================== */
let queryClient: QueryClient

if (import.meta.hot) {
  queryClient = import.meta.hot.data.queryClient || new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (import.meta.env.DEV) console.error('[React Query Error]', error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,  // 5 minutes
        gcTime: 10 * 60 * 1000,    // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: { retry: 1 },
    },
  })
  import.meta.hot.data.queryClient = queryClient
} else {
  queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (import.meta.env.DEV) console.error('[React Query Error]', error)
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
      mutations: { retry: 1 },
    },
  })
}

export { queryClient }

/* ======================================================
   Global Error Capture
====================================================== */
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

/* ======================================================
   Toast Options
====================================================== */
const toastOptions: ToastOptions = {
  duration: 5000,
  style: {
    background: '#1f2937',
    color: '#f9fafb',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 500,
  },
  className: 'dark:!bg-slate-800 dark:!text-slate-50',
}

/* ======================================================
   Providers Wrapper
====================================================== */
const Providers: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error, info) => console.error('[ErrorBoundary]', error, info)}
    onReset={() => window.location.reload()}
  >
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>
  </ErrorBoundary>
)

/* ======================================================
   Render App
====================================================== */
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <App />
      </BrowserRouter>

      <Toaster position="top-right" toastOptions={toastOptions} />

      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </Providers>
  </React.StrictMode>
)
