import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  sourceFiles,
} from './CanvasArchitectureTestSources'

const canonicalAffordanceModules = import.meta.glob(
  '../../../packages/dom-edit-affordance/src/react/editor/*.{ts,tsx}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

describe('EditorEngine boundaries', () => {
  it('keeps the engine independent from React, products, affordances, and the legacy item runtime', () => {
    const files = productionFiles('src/canvas/editor-engine/')
    const imports = files.flatMap(getImportReferences)
    const source = files.map((file) => file.source).join('\n')

    expect(files.length).toBeGreaterThan(0)
    expect(imports.filter((reference) =>
      reference.specifier === 'react' ||
      reference.specifier.startsWith('react/') ||
      reference.specifier.includes('dom-edit-affordance') ||
      reference.target.startsWith('src/canvas/app/') ||
      reference.target.startsWith('src/canvas/entities/') ||
      reference.target.startsWith('src/canvas/host/') ||
      reference.target.startsWith('src/canvas/react-design-renderer/') ||
      reference.target.startsWith('src/canvas/renderer/') ||
      /figma|figjam/i.test(reference.specifier),
    )).toEqual([])
    expect(source).not.toMatch(/\b(?:CanvasItem|ReactNode|ReactElement)\b/)
    expect(source).not.toMatch(/\b(?:historyGroup|propagation)\b/)
  })

  it('lets canonical affordances depend on the editor facade without product or storage vocabulary', () => {
    const source = Object.values(canonicalAffordanceModules).join('\n')

    expect(Object.keys(canonicalAffordanceModules).length).toBeGreaterThan(0)
    expect(source).toContain('@interactive-os/canvas/editor')
    expect(source).not.toMatch(/Figma|FigJam|CanvasItem/)
    expect(source).not.toContain('FigmaCloneDomEditModel')
    expect(source).not.toContain('DesignDocumentChange')
    expect(source).not.toContain('historyGroup')
  })
})

function productionFiles(prefix: string) {
  return sourceFiles.filter((file) =>
    file.path.startsWith(prefix) &&
    !file.path.endsWith('.test.ts') &&
    !file.path.endsWith('.test.tsx'))
}
