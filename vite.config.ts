import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'puppeteer',
        'better-sqlite3',
        'electron',
      ],
    },
  },
  optimizeDeps: {
    exclude: [
      'puppeteer',
      'better-sqlite3',
    ],
  },
})
