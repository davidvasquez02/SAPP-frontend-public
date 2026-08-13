import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawProxyTarget = env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:8080'
  const proxyTarget = rawProxyTarget.replace(/\/\/localhost\b/i, '//127.0.0.1')
  const proxyLocal = proxyTarget.includes('127.0.0.1') || /localhost/i.test(rawProxyTarget)

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
      proxy: {
        '/api/sapp': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: proxyLocal ? (path) => path.replace(/^\/api\/sapp/, '') : undefined,
        },
      },
    },
  }
})
