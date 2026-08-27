import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const extractTarget = env.VITE_EXTRACT_API_URL ? new URL(env.VITE_EXTRACT_API_URL).origin : 'http://155.248.254.195:5000'
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/predict': { target: env.VITE_PREDICT_API_URL || 'http://155.248.254.195:6000', rewrite: (path) => path.replace(/^\/api\/predict/, '/predict'), changeOrigin: true },
        '/api/extract': { target: extractTarget, rewrite: (path) => path.replace(/^\/api\/extract/, '/extract'), changeOrigin: true },
        '/api/receive': { target: env.VITE_RECEIVE_API_URL || 'http://155.248.254.195:6000', rewrite: (path) => path.replace(/^\/api\/receive/, '/receive'), changeOrigin: true },
        '/api/feedback': { target: env.VITE_FEEDBACK_API_URL || 'http://155.248.254.195:5000', rewrite: (path) => path.replace(/^\/api\/feedback/, '/submit_feedback'), changeOrigin: true },
      },
    },
  }
})
