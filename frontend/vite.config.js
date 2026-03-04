import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const rootDir = path.dirname(fileURLToPath(import.meta.url))
  const isProd = mode === 'production'
  const isAnalyze = mode === 'analyze'

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      svgr({
        svgrOptions: {
          icon: true,
        },
      }),
      isAnalyze &&
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
        '@components/customers': path.resolve(rootDir, './src/features/customers/components'),
        '@components/loans': path.resolve(rootDir, './src/features/loans/components'),
        '@components/repayments': path.resolve(rootDir, './src/features/repayments/components'),
        '@components/notifications': path.resolve(rootDir, './src/features/notifications/components'),
        '@components/dashboard': path.resolve(rootDir, './src/features/dashboard/components'),
        '@components/admin/roles': path.resolve(rootDir, './src/features/admin/roles/components'),
        '@components/admin/staff': path.resolve(rootDir, './src/features/admin/staff/components'),
        '@components/admin/audit': path.resolve(rootDir, './src/features/admin/audit/components'),
        '@components/admin': path.resolve(rootDir, './src/features/admin'),
        '@components': path.resolve(rootDir, './src/shared/components'),
        '@pages': path.resolve(rootDir, './src/features'),
        '@hooks': path.resolve(rootDir, './src/features/auth/hooks'),
        '@utils': path.resolve(rootDir, './src/shared/utils'),
        '@api/axios': path.resolve(rootDir, './src/core/api/axios.js'),
        '@api/admin': path.resolve(rootDir, './src/features/admin/dashboard/services/admin.js'),
        '@api/audit': path.resolve(rootDir, './src/features/admin/audit/services/audit.js'),
        '@api/auth': path.resolve(rootDir, './src/features/auth/services/auth.js'),
        '@api/customers': path.resolve(rootDir, './src/features/customers/services/customers.js'),
        '@api/loans': path.resolve(rootDir, './src/features/loans/services/loans.js'),
        '@api/mpesa': path.resolve(rootDir, './src/features/repayments/services/mpesa.js'),
        '@api/notifications': path.resolve(rootDir, './src/features/notifications/services/notifications.js'),
        '@api/repayments': path.resolve(rootDir, './src/features/repayments/services/repayments.js'),
        '@api/reports': path.resolve(rootDir, './src/features/reports/services/reports.js'),
        '@api': path.resolve(rootDir, './src/core/api'),
        '@styles': path.resolve(rootDir, './src/styles'),
        '@router': path.resolve(rootDir, './src/core/router'),
        '@contexts': path.resolve(rootDir, './src/core/contexts'),
      },
      extensions: ['.js', '.jsx', '.json'],
    },

    server: {
      port: 3000,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 3000,
      host: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: !isProd,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'clsx', 'tailwind-merge'],
            forms: ['react-hook-form'],
            charts: ['recharts'],
            utils: ['axios', 'date-fns'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|svg|gif|webp)$/i.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.css$/i.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
      chunkSizeWarningLimit: 900,
    },

    test: {
      globals: true,
      environment: 'jsdom',
    },

    css: {
      postcss: './postcss.config.js',
    },
  }
})
