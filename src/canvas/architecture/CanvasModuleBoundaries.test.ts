import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  getImportsFrom,
  getImportsFromOutside,
  getSourceFile,
  sourceFiles,
  targetsAnyLayer,
} from './CanvasArchitectureTestSources'

describe('Canvas module layer boundaries', () => {
  it('keeps stable entities independent from implementation layers', () => {
    const violations = getImportsFrom('src/canvas/entities/')
      .filter((reference) =>
        targetsAnyLayer(reference, ['app', 'engine', 'host', 'renderer', 'ui']),
      )

    expect(violations).toEqual([])
  })


  it('keeps stable entities as type-only public contracts', () => {
    const entitiesEntry = getSourceFile('src/canvas/entities/index.ts')
    const runtimeExports = entitiesEntry.source.match(/^export\s+\{/gm) ?? []
    const internalEntityImports = getImportsFromOutside('src/canvas/entities/')
      .filter((reference) =>
        reference.target.startsWith('src/canvas/entities/') &&
        reference.target !== 'src/canvas/entities',
      )

    expect(runtimeExports).toEqual([])
    expect(entitiesEntry.source).not.toContain('isCanvasCustomToolId')
    expect(internalEntityImports).toEqual([])
    expect(getSourceFile('src/canvas/index.ts').source).not.toContain(
      'CanvasEntities',
    )
  })


  it('keeps the engine independent from host, app, renderer, and ui modules', () => {
    const violations = getImportsFrom('src/canvas/engine/')
      .filter((reference) =>
        targetsAnyLayer(reference, ['app', 'host', 'renderer', 'ui']),
      )

    expect(violations).toEqual([])
  })

  it('keeps headless canvas layers independent from browser runtime input', () => {
    const headlessPrefixes = [
      'src/canvas/core/',
      'src/canvas/engine/',
      'src/canvas/foundation/',
    ]
    const violations = sourceFiles
      .filter((file) => headlessPrefixes.some((prefix) =>
        file.path.startsWith(prefix),
      ))
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target.startsWith('src/canvas/browser-runtime'),
      )

    expect(violations).toEqual([])
  })


  it('keeps host access behind the host public facade outside the host layer', () => {
    const violations = getImportsFromOutside('src/canvas/host/')
      .filter((reference) => reference.target.startsWith('src/canvas/host/'))

    expect(violations).toEqual([])
  })


  it('keeps shared ui primitives independent from app workflow and the whiteboard host', () => {
    const violations = getImportsFrom('src/canvas/ui/')
      .filter((reference) =>
        reference.target === 'src/canvas/host' ||
        reference.target === 'src/canvas/app' ||
        reference.target.startsWith('src/canvas/app/'),
      )

    expect(violations).toEqual([])
  })


  it('keeps the app shell imports limited to workflow and feature views', () => {
    const viewPrefixes = [
      'src/canvas/app/affordances/controls/',
      'src/canvas/app/affordances/editing/inspector/',
      'src/canvas/app/affordances/editing/text-editor/',
    ]
    const violations = getImportsFrom('src/canvas/app/shell/')
      .filter((reference) =>
        reference.target.startsWith('src/canvas/app/') &&
        !reference.target.startsWith('src/canvas/app/shell') &&
        reference.target !== 'src/canvas/app/workflow' &&
        reference.target !== 'src/canvas/app/feature-packs' &&
        !viewPrefixes.some((prefix) => reference.target.startsWith(prefix)),
      )

    expect(violations).toEqual([])
  })


  it('keeps renderer component presentation resolution out of the renderer', () => {
    const violations = sourceFiles
      .filter((file) => file.path.startsWith('src/canvas/renderer/'))
      .flatMap((file) =>
        file.source.includes('CANVAS_COMPONENT_LIBRARY') ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })


  it('keeps default app assembly details at the workflow assembly seam', () => {
    const assemblyTerms =
      /\b(CANVAS_COMPONENT_LIBRARY|CANVAS_ITEM_ENGINE_ADAPTERS|INITIAL_ITEMS)\b/
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx') &&
        file.path !== 'src/canvas/app/index.ts' &&
        file.path !==
          'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
      )
      .flatMap((file) =>
        assemblyTerms.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })


  it('keeps product-specific custom item ids outside canvas implementation', () => {
    const productCustomTerms =
      /\b(risk-node|custom:risk|demo-risk-text|decision-node|custom:decision|demo-decision)\b|kind:\s*['"](risk|decision)['"]/
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/') &&
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx'),
      )
      .flatMap((file) =>
        productCustomTerms.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })


  it('keeps Core bounds resize rules behind a named module', () => {
    const primitivesFile = getSourceFile(
      'src/canvas/core/CanvasCorePrimitives.ts',
    )
    const boundsResizeFile = getSourceFile(
      'src/canvas/core/CanvasBoundsResize.ts',
    )

    expect(primitivesFile.source).toContain("from './CanvasBoundsResize'")
    expect(primitivesFile.source).not.toContain('resizeBoundsFromAnchor')
    expect(primitivesFile.source).not.toContain('preserveResizeAspectRatio')
    expect(boundsResizeFile.source).toContain(
      'export function resizeBounds',
    )
    expect(boundsResizeFile.source).toContain('resizeBoundsFromAnchor')
    expect(boundsResizeFile.source).toContain('preserveResizeAspectRatio')
  })


  it('keeps renderer stage orchestration independent from whiteboard canvas items', () => {
    const whiteboardItemTerms =
      /\b(CanvasItem|RectItem|TextItem|GroupItem|CanvasComponentItem|getCanvasItemBounds|getCanvasItemsBounds|CANVAS_COMPONENT_LIBRARY)\b/
    const violations = sourceFiles
      .filter((file) => file.path.startsWith('src/canvas/renderer/'))
      .flatMap((file) => whiteboardItemTerms.test(file.source) ? [file.path] : [])

    expect(violations).toEqual([])
  })


  it('keeps app and ui imports behind the renderer public facade', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') ||
        file.path.startsWith('src/canvas/ui/'),
      )
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target.startsWith('src/canvas/renderer/') &&
        reference.target !== 'src/canvas/renderer',
      )

    expect(violations).toEqual([])
  })


  it('keeps the app shell independent from concrete renderer stage modules', () => {
    const violations = getImportsFrom('src/canvas/app/shell/')
      .filter((reference) => reference.target.startsWith('src/canvas/renderer'))

    expect(violations).toEqual([])
  })


  it('keeps app modules from depending on the broad rendering barrel', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.startsWith('src/canvas/app/rendering/'),
      )
      .flatMap((file) =>
        /from ['"]\.\.\/rendering['"]/.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })


  it('keeps json-document ownership inside document-owning modules', () => {
    const documentOwnerPrefixes = [
      'src/canvas/host/document/',
      'src/canvas/design-document/',
    ]
    const violations = sourceFiles
      .filter((file) =>
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx'),
      )
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target === '@interactive-os/json-document' ||
        reference.target.startsWith('@interactive-os/json-document-'),
      )
      .filter((reference) =>
        !documentOwnerPrefixes.some((prefix) =>
          reference.from.startsWith(prefix),
        ),
      )

    expect(violations).toEqual([])
  })

})
