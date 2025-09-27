import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Auth flow routes handled by Flask
      '/login':    { target: 'http://localhost:8000', changeOrigin: true },
      '/callback': { target: 'http://localhost:8000', changeOrigin: true },
      '/logout':   { target: 'http://localhost:8000', changeOrigin: true },
      '/session':  { target: 'http://localhost:8000', changeOrigin: true },
      // keep for future API endpoints if you add any
      '/api':      { target: 'http://localhost:8000', changeOrigin: true }
    }
  }
})
