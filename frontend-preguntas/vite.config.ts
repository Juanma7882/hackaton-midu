import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3003,
    watch: {
      usePolling: true
    }
  },
  preview: {
    host: true,
    port: 3003,
  }
})
