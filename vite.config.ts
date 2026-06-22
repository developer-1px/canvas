import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const canvasRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist/app',
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
        find: '@interactive-os/figma-clone/style.css',
        replacement: fileURLToPath(
          new URL(
            './packages/figma-clone/dist/FigmaCloneApp.css',
            import.meta.url,
          ),
        ),
      },
      {
        find: '@interactive-os/figma-clone/dom-editor',
        replacement: fileURLToPath(
          new URL(
            './packages/figma-clone/dist/dom-editor/index.js',
            import.meta.url,
          ),
        ),
      },
      {
        find: '@interactive-os/figma-clone',
        replacement: fileURLToPath(
          new URL('./packages/figma-clone/dist/index.js', import.meta.url),
        ),
      },
    ],
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
