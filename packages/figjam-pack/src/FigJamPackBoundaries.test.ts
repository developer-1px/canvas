import { describe, expect, it } from 'vitest'
import { FIGJAM_PRODUCT_DEFINITIONS } from './index'

const productionModules = import.meta.glob([
  './*.ts',
  './*.tsx',
  '!./*.test.ts',
  '!./*.test.tsx',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const packageModules = import.meta.glob('../package.json', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const canonicalEngineModules = import.meta.glob([
  '../../../src/canvas/editor-engine/*.ts',
  '../../../src/canvas/react-design-renderer/*.ts',
  '../../../src/canvas/react-design-renderer/*.tsx',
  '../../../src/canvas/app/**/*.ts',
  '../../../src/canvas/app/**/*.tsx',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('FigJam pack boundaries', () => {
  it('depends only on the public React design authoring facade', () => {
    const source = Object.values(productionModules).join('\n')
    const bareImports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]
      .map(([, specifier]) => specifier)
      .filter((specifier) => !specifier.startsWith('.'))

    expect(Object.keys(productionModules).length).toBeGreaterThanOrEqual(18)
    expect(new Set(bareImports)).toEqual(new Set([
      '@interactive-os/canvas/react-design',
      'react',
    ]))
    expect(source).not.toMatch(
      /\bCanvasItem\b|<canvas|foreignObject|src\/demo|canvas\/(?:app|entities|host)/,
    )
  })

  it('keeps family ids and the private pack out of canonical engine switches', () => {
    const source = Object.values(canonicalEngineModules).join('\n')
    const familyIds = new RegExp(
      FIGJAM_PRODUCT_DEFINITIONS
        .map(({ id }) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
    )

    expect(source).not.toMatch(familyIds)
    expect(source).not.toContain('@interactive-os/figjam-pack')
  })

  it('publishes only the private pack entry and its existing-token styles', () => {
    const manifest = JSON.parse(packageModules['../package.json'])

    expect(manifest).toMatchObject({
      name: '@interactive-os/figjam-pack',
      private: true,
      exports: {
        '.': './src/index.ts',
        './style.css': './src/style.css',
      },
      peerDependencies: {
        '@interactive-os/canvas': '^0.1.1',
        react: '^19.0.0',
      },
    })
    expect(manifest.dependencies).toBeUndefined()
  })
})
