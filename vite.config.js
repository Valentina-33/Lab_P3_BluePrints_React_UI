import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // El backend (Spring Boot) no tiene CORS habilitado, así que en dev
      // dejamos que Vite reenvíe las peticiones /api server-to-server.
      // Así el navegador solo habla con localhost:5173 y no lo bloquea.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
