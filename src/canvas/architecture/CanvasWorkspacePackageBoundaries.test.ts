import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  type SourceFile,
} from './CanvasArchitectureTestSources'

const packageModules = import.meta.glob(
  '../../../packages/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const workspaceManifestModules = import.meta.glob(
  '../../../packages/*/package.json',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const canvasManifestModules = import.meta.glob('../../../package.json', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const packageSourceFiles: SourceFile[] = Object.entries(packageModules)
  .map(([path, source]) => ({
    path: path.replace(/^\.\.\/\.\.\/\.\.\//, ''),
    source,
  }))

type PackageManifest = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  exports?: Record<string, unknown>
  name: string
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const canvasManifest = JSON.parse(
  canvasManifestModules['../../../package.json'],
) as PackageManifest
const workspaceManifests = new Map(
  Object.entries(workspaceManifestModules).map(([path, source]) => [
    path.replace(/^\.\.\/\.\.\/\.\.\//, '').replace(/\/package\.json$/, ''),
    JSON.parse(source) as PackageManifest,
  ]),
)

describe('Canvas workspace package boundaries', () => {
  it('keeps production and test consumers on public canvas package subpaths', () => {
    const privateCanvasImports = packageSourceFiles
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target === 'src/canvas' ||
        reference.target.startsWith('src/canvas/'),
      )

    expect(privateCanvasImports).toEqual([])
  })

  it('uses declared Canvas dependencies and exported package subpaths', () => {
    const canvasImports = packageSourceFiles
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.specifier === canvasManifest.name ||
        reference.specifier.startsWith(`${canvasManifest.name}/`),
      )
    const publicSpecifiers = new Set(
      Object.keys(canvasManifest.exports ?? {}).map((subpath) =>
        subpath === '.'
          ? canvasManifest.name
          : `${canvasManifest.name}${subpath.slice(1)}`,
      ),
    )
    const privateSubpathImports = canvasImports.filter(
      (reference) => !publicSpecifiers.has(reference.specifier),
    )
    const undeclaredDependencyImports = canvasImports.filter((reference) => {
      const packageDirectory = reference.from.split('/').slice(0, 2).join('/')
      const manifest = workspaceManifests.get(packageDirectory)
      const declaredDependencies = {
        ...manifest?.dependencies,
        ...manifest?.devDependencies,
        ...manifest?.optionalDependencies,
        ...manifest?.peerDependencies,
      }

      return !(canvasManifest.name in declaredDependencies)
    })

    expect(privateSubpathImports).toEqual([])
    expect(undeclaredDependencyImports).toEqual([])
  })
})
