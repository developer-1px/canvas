import { describe, expect, it } from 'vitest'
import * as ts from 'typescript'
import viteConfig from '../../../vite.config'
import playwrightConfig from '../../../playwright.config'
import appTsconfigSource from '../../../tsconfig.app.json?raw'

type CanvasViteConfig = {
  build?: {
    outDir?: string
    rolldownOptions?: {
      output?: {
        manualChunks?: (id: string) => string | undefined
      }
    }
  }
  resolve?: {
    alias?: CanvasViteAlias[]
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

type CanvasViteAlias = {
  find: string
  replacement: string
}

type CanvasAppTsconfig = {
  compilerOptions?: {
    paths?: Record<string, string[]>
  }
  exclude?: string[]
  include?: string[]
}

const config = viteConfig as CanvasViteConfig
const appTsconfig = ts.parseConfigFileTextToJson(
  'tsconfig.app.json',
  appTsconfigSource,
).config as CanvasAppTsconfig
const e2eConfig = playwrightConfig as {
  webServer?: {
    command?: string
    reuseExistingServer?: boolean
    url?: string
  }
}
describe('Canvas build config', () => {
  it('keeps package aliases on built demo package outputs', () => {
    expect(getAliasReplacement('@interactive-os/figma-clone')).toContain(
      'packages/figma-clone/dist/index.js',
    )
    expect(getAliasReplacement('@interactive-os/figma-clone/dom-editor'))
      .toContain('packages/figma-clone/dist/dom-editor/index.js')
    expect(getAliasReplacement('@interactive-os/figma-clone/style.css'))
      .toContain('packages/figma-clone/dist/FigmaCloneApp.css')
  })

  it('keeps linked peer dependencies deduped', () => {
    expect(config.resolve?.dedupe).toEqual(
      expect.arrayContaining(['react', 'react-dom', 'zod']),
    )
  })

  it('keeps app build output separate from package output', () => {
    expect(config.build?.outDir).toBe('dist/app')
  })

  it('keeps app TypeScript build on app sources and built package entries', () => {
    expect(appTsconfig.include).toEqual(['src'])
    expect(appTsconfig.include).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^packages\//),
      ]),
    )
    expect(appTsconfig.exclude).toEqual(
      expect.arrayContaining([
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/canvas/architecture/**',
      ]),
    )
    expect(appTsconfig.compilerOptions?.paths).toMatchObject({
      '@interactive-os/figma-clone': [
        './packages/figma-clone/dist/index.d.ts',
      ],
      '@interactive-os/figma-clone/dom-editor': [
        './packages/figma-clone/dist/dom-editor/index.d.ts',
      ],
      '@interactive-os/figma-clone/style.css': [
        './packages/figma-clone/dist/FigmaCloneApp.css',
      ],
    })
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

function getAliasReplacement(find: string): string {
  return config.resolve?.alias?.find((alias) => alias.find === find)
    ?.replacement ?? ''
}
