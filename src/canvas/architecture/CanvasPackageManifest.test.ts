import { describe, expect, it } from 'vitest'

type CanvasPackageJson = {
  dependencies?: Record<string, string>
  exports?: Record<string, CanvasPackageExportEntry | CanvasPackageStyleExportEntry>
  files?: string[]
  name?: string
  peerDependencies?: Record<string, string>
  publishConfig?: {
    access?: string
    provenance?: boolean
    registry?: string
  }
  private?: boolean
  sideEffects?: boolean | string[]
  types?: string
  version?: string
}

type CanvasPackageExportEntry = {
  default: string
  import: string
  types: string
}

type CanvasPackageStyleExportEntry = {
  default: string
}

const packageModules = import.meta.glob('../../../package.json', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const sourceModules = {
  ...import.meta.glob('../**/index.ts', {
    eager: true,
    import: 'default',
    query: '?raw',
  }),
  ...import.meta.glob('../renderer/svg-drawing-primitives.ts', {
    eager: true,
    import: 'default',
    query: '?raw',
  }),
} as Record<string, string>

const packageJson = JSON.parse(
  packageModules['../../../package.json'],
) as CanvasPackageJson
const hostDocumentDependencyName = '@interactive-os/json-document'
const publishedRuntimeDependencies = [
  '@interactive-os/interaction',
  '@interactive-os/json-document',
  '@interactive-os/json-document-grouping',
  '@interactive-os/json-document-patch-preview',
  '@interactive-os/json-document-search-replace',
  '@interactive-os/object-surface',
  '@interactive-os/preview-surface',
  'lucide-react',
]
const sourcePaths = new Set(
  Object.keys(sourceModules).map((path) =>
    path.replace(/^\.\.\//, './src/canvas/'),
  ),
)

describe('Canvas package manifest', () => {
  it('keeps the reusable canvas package entry explicit', () => {
    expect(packageJson.name).toBe('@interactive-os/canvas')
    expect(packageJson.private).toBe(false)
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/)
    expect(packageJson.sideEffects).toEqual(['**/*.css'])
    expect(packageJson.types).toBe('./dist/package/canvas/index.d.ts')
    expect(packageJson.files).toEqual(['dist/package', 'README.md'])
    expect(packageJson.publishConfig).toEqual({
      access: 'public',
      provenance: true,
      registry: 'https://registry.npmjs.org/',
    })
    expect(packageJson.exports).toEqual({
      '.': createPackageExportEntry('./dist/package/canvas/index'),
      './app': createPackageExportEntry('./dist/package/canvas/app/index'),
      './app/authoring': createPackageExportEntry(
        './dist/package/canvas/app/authoring/index',
      ),
      './core': createPackageExportEntry('./dist/package/canvas/core/index'),
      './foundation': createPackageExportEntry(
        './dist/package/canvas/foundation/index',
      ),
      './engine': createPackageExportEntry('./dist/package/canvas/engine/index'),
      './entities': createPackageExportEntry('./dist/package/canvas/entities/index'),
      './host': createPackageExportEntry('./dist/package/canvas/host/index'),
      './renderer': createPackageExportEntry('./dist/package/canvas/renderer/index'),
      './renderer/svg-drawing-primitives': createPackageExportEntry(
        './dist/package/canvas/renderer/svg-drawing-primitives',
      ),
      './style.css': {
        default: './dist/package/canvas/app/shell/CanvasApp.css',
      },
    })
  })

  it('points package exports at built equivalents of canvas public facades', () => {
    const exportedPaths = Object.values(packageJson.exports ?? {})
      .filter(isPackageCodeExportEntry)
      .flatMap((entry) => [entry.types, entry.import, entry.default])

    expect(exportedPaths).toHaveLength(30)
    expect(exportedPaths.every((path) => path.startsWith('./dist/package/canvas/'))).toBe(true)
    expect(exportedPaths.every((path) =>
      path.endsWith('/index.d.ts') ||
      path.endsWith('/index.js') ||
      path.endsWith('/svg-drawing-primitives.d.ts') ||
      path.endsWith('/svg-drawing-primitives.js'))).toBe(true)
    expect(
      exportedPaths
        .filter((path) => path.endsWith('.js'))
        .every((path) => sourcePaths.has(toSourceIndexPath(path))),
    ).toBe(true)
  })

  it('keeps package export type and runtime targets aligned', () => {
    const exportEntries = Object.entries(packageJson.exports ?? {})
      .flatMap(([subpath, entry]) =>
        isPackageCodeExportEntry(entry) ? [[subpath, entry] as const] : [],
      )

    expect(exportEntries).toHaveLength(10)
    for (const [, entry] of exportEntries) {
      expect(entry.types).toBe(entry.import.replace(/\.js$/, '.d.ts'))
      expect(entry.import).toBe(entry.default)
    }
  })

  it('declares shared runtimes as peer dependencies', () => {
    expect(packageJson.peerDependencies).toEqual({
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      zod: '^4.0.0',
    })
    expect(packageJson.dependencies).toEqual(
      expect.objectContaining({
        [hostDocumentDependencyName]: expect.any(String),
      }),
    )
    expect(packageJson.dependencies).not.toHaveProperty('react')
    expect(packageJson.dependencies).not.toHaveProperty('react-dom')
    expect(packageJson.dependencies).not.toHaveProperty('zod')
    for (const dependency of publishedRuntimeDependencies) {
      expect(packageJson.dependencies?.[dependency]).toMatch(/^\^?\d+\.\d+\.\d+/)
    }
  })
})

function createPackageExportEntry(path: string): CanvasPackageExportEntry {
  return {
    types: `${path}.d.ts`,
    import: `${path}.js`,
    default: `${path}.js`,
  }
}

function isPackageCodeExportEntry(
  entry: CanvasPackageExportEntry | CanvasPackageStyleExportEntry,
): entry is CanvasPackageExportEntry {
  return 'types' in entry
}

function toSourceIndexPath(path: string) {
  return path
    .replace(/^\.\.\/dist\/package\//, './src/')
    .replace(/^\.\//, './')
    .replace(/^\.\.\/\.\//, './')
    .replace(/^\.\//, './')
    .replace(/^\.\/dist\/package\//, './src/')
    .replace(/\.js$/, '.ts')
}
