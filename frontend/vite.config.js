import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'
import { exec } from 'child_process'

// -------------------------------
// Custom Vite plugin to log TS errors without failing build
// -------------------------------
function typeCheckPlugin() {
  return {
    name: 'vite:type-check',
    buildStart() {
      exec('tsc --noEmit', (err, stdout, stderr) => {
        if (stdout) {
          console.log('\n\x1b[33mTypeScript Check Output:\x1b[0m\n', stdout)
        }
        if (stderr) {
          console.error('\n\x1b[31mTypeScript Errors:\x1b[0m\n', stderr)
        }
        if (err) {
          console.log('\x1b[36mTS check completed with errors (build continues)\x1b[0m')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const isAnalyze = mode === 'analyze'

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
        },
      }),
      typeCheckPlugin(), // << Inject our TS type-check plugin here
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
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@store': path.resolve(__dirname, './src/store'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
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
            state: ['@reduxjs/toolkit', 'react-redux'],
            ui: ['lucide-react', 'clsx', 'tailwind-merge'],
            forms: ['react-hook-form', 'zod'],
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
      setupFiles: './src/test/setup.ts',
    },

    css: {
      postcss: './postcss.config.js',
    },
  }
})
