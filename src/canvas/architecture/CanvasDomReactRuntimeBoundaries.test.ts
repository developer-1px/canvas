import { describe, expect, it } from 'vitest'
import {
  getImportReferences,
  sourceFiles,
} from './CanvasArchitectureTestSources'

const directDomProductModules = import.meta.glob(
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

  it('keeps ReactDesignRenderer independent from products and legacy canvas items', () => {
    const files = productionFiles('src/canvas/react-design-renderer/')
    const source = files.map((file) => file.source).join('\n')

    expect(files.length).toBeGreaterThan(0)
    expect(source).not.toMatch(/(?:Figma|FigJam|CanvasItem|foreignObject)/)
    expect(source).not.toContain('/host/')
    expect(source).not.toContain('/entities/')
  })

  it('keeps the direct Figma product path off the compatibility and SVG runtimes', () => {
    const source = Object.values(directDomProductModules).join('\n')

    expect(Object.keys(directDomProductModules).length).toBeGreaterThan(0)
    expect(source).not.toContain('FigmaWorkspaceDesignDocumentProjection')
    expect(source).not.toContain('FigmaCloneDomEditModel')
    expect(source).not.toMatch(/\bCanvasApp\b/)
    expect(source).not.toMatch(/\bCanvasItem\b/)
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
