import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  getSourceFile,
  sourceFiles,
  type ImportReference,
  type SourceFile,
} from './CanvasArchitectureTestSources'

const figJamProductModules = import.meta.glob(
  '../../../packages/figjam-clone/src/**/*.{ts,tsx}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const figmaProductModules = import.meta.glob(
  '../../../packages/figma-clone/src/**/*.{ts,tsx}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const migrationMatrixModules = import.meta.glob(
  '../../../docs/figjam-react-migration-matrix.md',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const LEGACY_FIGJAM_IMPORT_SPECIFIERS = [
  '@interactive-os/canvas',
  '@interactive-os/canvas/app',
  '@interactive-os/canvas/entities',
  '@interactive-os/canvas/host',
  '@interactive-os/canvas/renderer',
] as const

const LEGACY_FIGJAM_IMPORT_TARGETS = [
  'src/canvas/app',
  'src/canvas/entities',
  'src/canvas/host',
  'src/canvas/renderer',
] as const

const GENERIC_EDITOR_PREFIXES = [
  'src/canvas/design-document/',
  'src/canvas/dom-projection/',
  'src/canvas/editor-engine/',
  'src/canvas/engine/',
  'src/canvas/react-design/',
  'src/canvas/react-design-renderer/',
  'src/canvas/renderer/',
] as const

describe('FigJam canonical React cutover boundaries', () => {
  it('keeps the checked migration matrix exhaustive for all 21 exposed families', () => {
    const matrix = Object.values(migrationMatrixModules)[0]

    expect(Object.keys(migrationMatrixModules)).toHaveLength(1)
    expect(matrix).toBeDefined()

    const rows = matrix?.split('\n')
      .filter((line) => line.startsWith('| [x] |')) ?? []
    const header = matrix?.split('\n')
      .find((line) => line.startsWith('| Covered |'))
    const expectedCellCount = header ? getMarkdownTableCellCount(header) : 0

    expect(rows).toHaveLength(21)
    expect(expectedCellCount).toBe(15)
    expect(rows.map(getMarkdownTableCellCount))
      .toEqual(Array.from({ length: 21 }, () => expectedCellCount))

    for (const heading of [
      'Canonical representation',
      'Create',
      'Render',
      'Select',
      'Edit',
      'Style',
      'Transform',
      'Marquee',
      'Clipboard',
      'History',
      'Persistence',
      'Deliberate alias or defer',
      'Evidence',
    ]) {
      expect(matrix).toContain(`| ${heading} `)
    }
  })

  it('routes the default FigJam product through FigJamCloneApp and removes the private fixture route', () => {
    const rootSource = getSourceFile('src/demo/CanvasRoot.tsx').source
    const routeSource = getSourceFile('src/demo/CanvasRootRoutes.ts').source
    const fixtureFiles = sourceFiles.filter((file) =>
      file.path.startsWith('src/demo/FigJamWidgetPackFixtureApp.'),
    )

    expect(rootSource).toMatch(
      /import\s*\{\s*FigJamCloneApp\s*\}\s*from\s*['"][^'"]*packages\/figjam-clone\/src['"]/,
    )
    expect(rootSource).toMatch(
      /if\s*\(\s*route\s*===\s*['"]figjam['"]\s*\)\s*\{\s*return\s*<FigJamCloneApp\b/,
    )
    expect(rootSource).not.toMatch(
      /route\s*===\s*['"]engine['"]\s*\|\|\s*route\s*===\s*['"]figjam['"]/,
    )
    expect(rootSource).not.toContain('FigJamWidgetPackFixtureApp')
    expect(routeSource).not.toContain('figjam-widgets')
    expect(fixtureFiles).toEqual([])
  })

  it('keeps the FigJam product runtime off CanvasItem, CanvasApp, Host, and the legacy SVG renderer', () => {
    const files = getProductionPackageFiles(
      figJamProductModules,
      'packages/figjam-clone/',
    )
    const imports = files.flatMap(getImportReferences)
    const source = files.map((file) => file.source).join('\n')

    expect(files.length).toBeGreaterThan(1)
    expect(files.some((file) => file.path.endsWith('/FigJamCloneApp.tsx')))
      .toBe(true)
    expect(imports.filter(isLegacyFigJamRuntimeImport)).toEqual([])
    expect(imports.some((reference) =>
      reference.specifier === '@interactive-os/figjam-pack',
    )).toBe(true)
    expect(source).not.toMatch(/\bCanvasApp\b/)
    expect(source).not.toMatch(/\bCanvasItem\b/)
    expect(source).not.toMatch(/\bCanvasWhiteboardSvg[A-Za-z]*\b/)
    expect(source).not.toMatch(/\bCanvasSvgStage\b/)
    expect(source).not.toContain('foreignObject')
  })

  it('keeps FigJam definition ids out of generic engines and renderers', () => {
    const files = sourceFiles.filter((file) =>
      isProductionSource(file) &&
      GENERIC_EDITOR_PREFIXES.some((prefix) => file.path.startsWith(prefix)),
    )
    const violations = files.flatMap((file) =>
      /\bfigjam\.[a-z][a-z0-9.-]*\b/i.test(file.source)
        ? [file.path]
        : [],
    )

    expect(files.length).toBeGreaterThan(0)
    expect(violations).toEqual([])
  })

  it('keeps the Figma product independent from the FigJam product and widget pack', () => {
    const files = getProductionPackageFiles(
      figmaProductModules,
      'packages/figma-clone/',
    )
    const imports = files.flatMap(getImportReferences)

    expect(files.length).toBeGreaterThan(1)
    expect(imports.filter((reference) =>
      /(?:^|\/)figjam-(?:clone|pack)(?:\/|$)/i.test(reference.specifier) ||
      /(?:^|\/)figjam-(?:clone|pack)(?:\/|$)/i.test(reference.target),
    )).toEqual([])
  })

  it('retains the public pre-1.0 CanvasItem compatibility export', () => {
    const packageEntry = getSourceFile('src/canvas/index.ts').source

    expect(packageEntry).toMatch(
      /export\s+type\s*\{[\s\S]*?\bCanvasItem\b[\s\S]*?\}\s*from\s*['"]\.\/entities['"]/,
    )
  })
})

function getProductionPackageFiles(
  modules: Record<string, string>,
  packagePrefix: string,
): SourceFile[] {
  return Object.entries(modules)
    .map(([path, source]) => ({
      path: normalizePackageModulePath(path, packagePrefix),
      source,
    }))
    .filter(isProductionSource)
}

function normalizePackageModulePath(path: string, packagePrefix: string) {
  const normalized = path.replace(/^(?:\.\.\/)+/, '')
  const packageIndex = normalized.indexOf(packagePrefix)

  return packageIndex === -1
    ? normalized
    : normalized.slice(packageIndex)
}

function getMarkdownTableCellCount(row: string) {
  return row.split('|').slice(1, -1).length
}

function isProductionSource(file: SourceFile) {
  return !/\.test\.[tj]sx?$/.test(file.path)
}

function isLegacyFigJamRuntimeImport(reference: ImportReference) {
  const [canvasPackageRoot, ...legacySubpaths] =
    LEGACY_FIGJAM_IMPORT_SPECIFIERS

  return (
    reference.specifier === canvasPackageRoot ||
    legacySubpaths.some((specifier) =>
      reference.specifier === specifier ||
      reference.specifier.startsWith(`${specifier}/`),
    ) ||
    LEGACY_FIGJAM_IMPORT_TARGETS.some((target) =>
      reference.target === target ||
      reference.target.startsWith(`${target}/`),
    ) ||
    /(?:^|\/)Canvas(?:WhiteboardSvg|SvgStage)[A-Za-z]*(?:\.[tj]sx?)?$/.test(
      reference.target,
    )
  )
}
