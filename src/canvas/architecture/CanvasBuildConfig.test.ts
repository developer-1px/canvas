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
    alias?: readonly {
      find: RegExp
      replacement: string
    }[]
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
describe('Canvas build config', () => {
  it('keeps linked peer dependencies deduped', () => {
    expect(config.resolve?.dedupe).toEqual(
      expect.arrayContaining(['react', 'react-dom', 'zod']),
    )
  })

  it('resolves canvas package imports to source entries for the dev server', () => {
    expect(config.resolve?.alias?.map((alias) => String(alias.find)))
      .toEqual([
        '/^@interactive-os\\/canvas$/',
        '/^@interactive-os\\/canvas\\/app$/',
        '/^@interactive-os\\/canvas\\/app\\/authoring$/',
        '/^@interactive-os\\/canvas\\/core$/',
        '/^@interactive-os\\/canvas\\/engine$/',
        '/^@interactive-os\\/canvas\\/entities$/',
        '/^@interactive-os\\/canvas\\/foundation$/',
        '/^@interactive-os\\/canvas\\/host$/',
        '/^@interactive-os\\/canvas\\/renderer$/',
        '/^@interactive-os\\/canvas\\/style\\.css$/',
      ])
    expect(config.resolve?.alias?.map((alias) => alias.replacement))
      .toEqual([
        expect.stringContaining('src/canvas/index.ts'),
        expect.stringContaining('src/canvas/app/index.ts'),
        expect.stringContaining('src/canvas/app/authoring/index.ts'),
        expect.stringContaining('src/canvas/core/index.ts'),
        expect.stringContaining('src/canvas/engine/index.ts'),
        expect.stringContaining('src/canvas/entities/index.ts'),
        expect.stringContaining('src/canvas/foundation/index.ts'),
        expect.stringContaining('src/canvas/host/index.ts'),
        expect.stringContaining('src/canvas/renderer/index.ts'),
        expect.stringContaining('src/canvas/app/shell/CanvasApp.css'),
      ])
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
        ],
      },
      host: '::',
      port: 53175,
      strictPort: true,
    })
  })

  it('forces e2e dev server dependency optimization for linked packages', () => {
    expect(e2eConfig.webServer).toMatchObject({
      command: expect.stringContaining('--force'),
      reuseExistingServer: !process.env.CI,
      url: 'http://127.0.0.1:53175',
    })
  })
})
