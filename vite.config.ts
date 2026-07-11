import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const canvasRoot = fileURLToPath(new URL('.', import.meta.url))
const canvasSourceEntry = fileURLToPath(
  new URL('./src/canvas/index.ts', import.meta.url),
)
const canvasAppSourceEntry = fileURLToPath(
  new URL('./src/canvas/app/index.ts', import.meta.url),
)
const canvasAuthoringSourceEntry = fileURLToPath(
  new URL('./src/canvas/app/authoring/index.ts', import.meta.url),
)
const canvasCoreSourceEntry = fileURLToPath(
  new URL('./src/canvas/core/index.ts', import.meta.url),
)
const canvasEngineSourceEntry = fileURLToPath(
  new URL('./src/canvas/engine/index.ts', import.meta.url),
)
const canvasEditorSourceEntry = fileURLToPath(
  new URL('./src/canvas/editor-engine/index.ts', import.meta.url),
)
const canvasEntitiesSourceEntry = fileURLToPath(
  new URL('./src/canvas/entities/index.ts', import.meta.url),
)
const canvasFoundationSourceEntry = fileURLToPath(
  new URL('./src/canvas/foundation/index.ts', import.meta.url),
)
const canvasHostSourceEntry = fileURLToPath(
  new URL('./src/canvas/host/index.ts', import.meta.url),
)
const canvasReactDesignSourceEntry = fileURLToPath(
  new URL('./src/canvas/react-design/index.ts', import.meta.url),
)
const canvasRendererSourceEntry = fileURLToPath(
  new URL('./src/canvas/renderer/index.ts', import.meta.url),
)
const canvasStyleSourceEntry = fileURLToPath(
  new URL('./src/canvas/app/shell/CanvasApp.css', import.meta.url),
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
        find: /^@interactive-os\/canvas$/,
        replacement: canvasSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/app$/,
        replacement: canvasAppSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/app\/authoring$/,
        replacement: canvasAuthoringSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/core$/,
        replacement: canvasCoreSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/engine$/,
        replacement: canvasEngineSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/editor$/,
        replacement: canvasEditorSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/entities$/,
        replacement: canvasEntitiesSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/foundation$/,
        replacement: canvasFoundationSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/host$/,
        replacement: canvasHostSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/react-design$/,
        replacement: canvasReactDesignSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/renderer$/,
        replacement: canvasRendererSourceEntry,
      },
      {
        find: /^@interactive-os\/canvas\/style\.css$/,
        replacement: canvasStyleSourceEntry,
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
