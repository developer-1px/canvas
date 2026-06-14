import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const canvasRoot = fileURLToPath(new URL('.', import.meta.url))

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
    fs: {
      allow: [canvasRoot],
    },
    host: '::',
    port: 53175,
    strictPort: true,
  },
})
