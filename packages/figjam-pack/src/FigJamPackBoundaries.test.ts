import { describe, expect, it } from 'vitest'

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

describe('FigJam pack boundaries', () => {
  it('depends only on the public React design authoring facade', () => {
    const source = Object.values(productionModules).join('\n')
    const bareImports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]
      .map(([, specifier]) => specifier)
      .filter((specifier) => !specifier.startsWith('.'))

    expect(Object.keys(productionModules)).toHaveLength(6)
    expect([...new Set(bareImports)]).toEqual([
      '@interactive-os/canvas/react-design',
    ])
    expect(source).not.toMatch(
      /\bCanvasItem\b|foreignObject|src\/demo|canvas\/(?:app|entities|host)/,
    )
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
