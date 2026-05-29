import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const zodCrudEntry = fileURLToPath(
  new URL('../zod-crud/packages/zod-crud/src/index.ts', import.meta.url),
)
const canvasRoot = fileURLToPath(new URL('.', import.meta.url))
const zodCrudSourceRoot = fileURLToPath(
  new URL('../zod-crud/packages/zod-crud/src', import.meta.url),
)

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
    alias: [
      {
        find: 'zod-crud',
        replacement: zodCrudEntry,
      },
    ],
    dedupe: ['react', 'react-dom', 'zod'],
  },
  server: {
    fs: {
      allow: [canvasRoot, zodCrudSourceRoot],
    },
    host: '::',
    port: 5173,
    strictPort: true,
  },
})
