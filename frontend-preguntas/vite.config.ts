import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
function obtenerApiProxyTarget(mode: string): string {
  const env = loadEnv(mode, '..', '')
  const proxyTarget = env.API_PROXY_TARGET?.trim() || env.VITE_API_PROXY_TARGET?.trim()

  if (proxyTarget) {
    return proxyTarget
  }

  const apiBaseUrl = env.VITE_API_BASE_URL?.trim()
  if (apiBaseUrl && /^https?:\/\//i.test(apiBaseUrl)) {
    return new URL(apiBaseUrl).origin
  }

  return 'http://backend:3000'
}

export default defineConfig(({ mode }) => {
  const apiProxyTarget = obtenerApiProxyTarget(mode)

  return {
    envDir: '..',
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 3003,
      watch: {
        usePolling: true,
      },
      allowedHosts: [
        'interviewquiz-frontend-827msf-063283-107-148-105-4.traefik.me',
      ],
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/logos': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 3003,
    },
  }
})
