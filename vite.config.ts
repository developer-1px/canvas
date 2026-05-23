import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react')) {
            return 'react'
          }

          return undefined
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'zod'],
  },
  server: {
    host: '::',
    port: 5173,
    strictPort: true,
  },
})
