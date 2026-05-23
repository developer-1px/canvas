import { describe, expect, it } from 'vitest'

type CanvasPackageJson = {
  dependencies?: Record<string, string>
  exports?: Record<string, string>
  peerDependencies?: Record<string, string>
  private?: boolean
  sideEffects?: boolean | string[]
  types?: string
}

const packageModules = import.meta.glob('../../../package.json', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const sourceModules = import.meta.glob('../**/index.ts', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const packageJson = JSON.parse(
  packageModules['../../../package.json'],
) as CanvasPackageJson
const hostDocumentDependencyName = ['zod', 'crud'].join('-')
const sourcePaths = new Set(
  Object.keys(sourceModules).map((path) =>
    path.replace(/^\.\.\//, './src/canvas/'),
  ),
)

describe('Canvas package manifest', () => {
  it('keeps the reusable canvas package entry explicit', () => {
    expect(packageJson.private).toBe(true)
    expect(packageJson.sideEffects).toEqual(['**/*.css'])
    expect(packageJson.types).toBe('./src/canvas/index.ts')
    expect(packageJson.exports).toEqual({
      '.': './src/canvas/index.ts',
      './app': './src/canvas/app/index.ts',
      './core': './src/canvas/core/index.ts',
      './engine': './src/canvas/engine/index.ts',
      './entities': './src/canvas/entities/index.ts',
      './host': './src/canvas/host/index.ts',
      './renderer': './src/canvas/renderer/index.ts',
    })
  })

  it('points package exports only at existing canvas public facades', () => {
    const exportedPaths = Object.values(packageJson.exports ?? {})

    expect(exportedPaths).toHaveLength(7)
    expect(exportedPaths.every((path) => sourcePaths.has(path))).toBe(true)
    expect(exportedPaths.every((path) => path.endsWith('/index.ts'))).toBe(true)
  })

  it('declares shared runtimes as peer dependencies', () => {
    expect(packageJson.peerDependencies).toEqual({
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      zod: '^4.0.0',
    })
    expect(packageJson.dependencies).toEqual(
      expect.objectContaining({
        react: expect.any(String),
        'react-dom': expect.any(String),
        zod: expect.any(String),
        [hostDocumentDependencyName]: expect.any(String),
      }),
    )
  })
})
