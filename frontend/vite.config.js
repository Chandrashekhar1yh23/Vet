import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // Bind to 0.0.0.0 — enables the Network: URL for other devices
    port: 5173,
  }
})
