import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true
      },
      '/chathub': {
        target: 'http://backend:8080',
        ws: true,
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://backend:8080',
        changeOrigin: true
      }
    }
  }
})
