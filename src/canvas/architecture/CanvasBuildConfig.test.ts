import { describe, expect, it } from 'vitest'
import viteConfig from '../../../vite.config'
import playwrightConfig from '../../../playwright.config'

type CanvasViteConfig = {
  build?: {
    rolldownOptions?: {
      output?: {
        manualChunks?: (id: string) => string | undefined
      }
    }
  }
  resolve?: {
    dedupe?: string[]
  }
  server?: {
    fs?: {
      allow?: string[]
    }
    host?: string
    port?: number
    strictPort?: boolean
  }
}

const config = viteConfig as CanvasViteConfig
const e2eConfig = playwrightConfig as {
  webServer?: {
    command?: string
    reuseExistingServer?: boolean
    url?: string
  }
}
const linkedDocumentPackageSource = [
  'zod',
  'crud/packages/zod',
  'crud/src',
].join('-')

describe('Canvas build config', () => {
  it('keeps linked peer dependencies deduped', () => {
    expect(config.resolve?.dedupe).toEqual(
      expect.arrayContaining(['react', 'react-dom', 'zod']),
    )
  })

  it('keeps React in a separate production chunk', () => {
    expect(
      config.build?.rolldownOptions?.output?.manualChunks?.(
        '/workspace/node_modules/react/index.js',
      ),
    ).toBe('react')
    expect(
      config.build?.rolldownOptions?.output?.manualChunks?.(
        '/workspace/src/main.tsx',
      ),
    ).toBeUndefined()
  })

  it('keeps the local dev server port deterministic across loopback hosts', () => {
    expect(config.server).toMatchObject({
      fs: {
        allow: [
          expect.stringContaining('@interactive-os/canvas'),
          expect.stringContaining(linkedDocumentPackageSource),
        ],
      },
      host: '::',
      port: 5173,
      strictPort: true,
    })
  })

  it('forces e2e dev server dependency optimization for linked packages', () => {
    expect(e2eConfig.webServer).toMatchObject({
      command: expect.stringContaining('--force'),
      reuseExistingServer: false,
      url: 'http://127.0.0.1:53173',
    })
  })
})
