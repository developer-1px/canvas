import { describe, expect, it } from 'vitest'
import {
  getImportReferences,
  sourceFiles,
} from './CanvasArchitectureTestSources'

const figmaProductEntryModules = import.meta.glob(
  '../../../packages/figma-clone/src/FigmaCloneApp.tsx',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const figmaProductSupportModules = import.meta.glob(
  '../../../packages/figma-clone/src/direct-dom/*.{ts,tsx}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

describe('direct DOM React runtime boundaries', () => {
  it('keeps DomProjection independent from React, products, and renderers', () => {
    const files = productionFiles('src/canvas/dom-projection/')
    const imports = files.flatMap(getImportReferences)

    expect(files.length).toBeGreaterThan(0)
    expect(imports.filter((reference) =>
      reference.specifier === 'react' ||
      reference.specifier.startsWith('react/') ||
      reference.target.includes('react-design-renderer') ||
      /figma|figjam/i.test(reference.specifier),
    )).toEqual([])
  })

  it('keeps the React design runtime independent from products and legacy canvas items', () => {
    const files = [
      ...productionFiles('src/canvas/react-design-renderer/'),
      ...productionFiles('src/canvas/react-design/'),
    ]
    const source = files.map((file) => file.source).join('\n')

    expect(files.length).toBeGreaterThan(0)
    expect(source).not.toMatch(/(?:Figma|FigJam|CanvasItem|foreignObject)/)
    expect(source).not.toContain('/host/')
    expect(source).not.toContain('/entities/')
  })

  it('keeps the final Figma runtime off legacy Canvas and compatibility paths', () => {
    const runtimeModules = Object.entries({
      ...figmaProductEntryModules,
      ...figmaProductSupportModules,
    }).filter(([path]) => !/\.test\.[tj]sx?$/.test(path))
    const source = runtimeModules.map(([, moduleSource]) => moduleSource)
      .join('\n')

    expect(Object.keys(figmaProductEntryModules)).toHaveLength(1)
    expect(runtimeModules.length).toBeGreaterThan(1)
    expect(source).not.toContain('FigmaWorkspaceDesignDocumentProjection')
    expect(source).not.toContain('FigmaCloneDomEditModel')
    expect(source).not.toContain('FigmaCloneDomDocument')
    expect(source).not.toContain('figmaCloneCanvas')
    expect(source).not.toMatch(
      /from ['"](?:\.\.?\/)+(?:dom-edit|dom-editor|figmaCloneCanvas)/,
    )
    expect(source).not.toMatch(/\bCanvasApp\b/)
    expect(source).not.toMatch(/\bCanvasItem\b/)
    expect(source).not.toMatch(
      /\b(?:createFigmaCloneCanvas(?:Items|Modules)|createFigmaCloneDomEditAdapter|projectFigmaWorkspaceDesignDocument|routeFigmaWorkspaceOwned(?:Edit|SectionEdit))\b/,
    )
    expect(source).not.toMatch(/getFigmaClone(?:SelectedCanvasItemId|CanvasItemIdForNode|DomCanvasFrameItemId)/)
    expect(source).not.toContain('foreignObject')
    expect(source).not.toMatch(/<svg\b/)
  })
})

function productionFiles(prefix: string) {
  return sourceFiles.filter((file) =>
    file.path.startsWith(prefix) &&
    !file.path.endsWith('.test.ts') &&
    !file.path.endsWith('.test.tsx'))
}
