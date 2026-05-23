import { describe, expect, it } from 'vitest'
import viteConfig from '../../../vite.config'

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
}

const config = viteConfig as CanvasViteConfig

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
})
