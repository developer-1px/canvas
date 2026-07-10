import { describe, expect, it } from 'vitest'

const modules = import.meta.glob([
  './FigmaWorkspaceDesignDocumentProjection.ts',
  './FigmaWorkspaceDesignDocumentCommands.ts',
  './FigmaWorkspaceEditOwnership.ts',
  '../dom-edit/FigmaCloneDomDocument.ts',
  '../FigmaCloneApp.tsx',
  '../index.ts',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('Figma workspace DesignDocument boundaries', () => {
  it('keeps the compatibility projection read-only', () => {
    const source = requireSource(
      './FigmaWorkspaceDesignDocumentProjection.ts',
    )

    expect(source).not.toMatch(/\bDesignDocument\b/)
    expect(source).not.toMatch(/\.(?:execute|undo|redo|replace|commit)\(/)
    expect(source).not.toContain('useJSONDocument')
    expect(source).not.toContain('createJSONDocument')
    expect(source).not.toContain('FigmaCloneDomDocument')
  })

  it('keeps canonical commands independent from the legacy writer', () => {
    const source = requireSource('./FigmaWorkspaceDesignDocumentCommands.ts')

    expect(source).not.toContain('FigmaCloneDomDocument')
    expect(source).not.toContain('useJSONDocument')
    expect(source).not.toContain('createJSONDocument')
    expect(source).not.toMatch(/\.replace\(/)
  })

  it('keeps the legacy writer independent from the canonical document', () => {
    const source = requireSource('../dom-edit/FigmaCloneDomDocument.ts')

    expect(source).not.toContain('/design-document')
  })

  it('routes every workspace-capable edit through the exclusive owner', () => {
    const router = requireSource('./FigmaWorkspaceEditOwnership.ts')
    const app = requireSource('../FigmaCloneApp.tsx')

    expect(router).not.toContain('FigmaCloneDomDocument')
    expect(router).not.toContain('useJSONDocument')
    expect(app.match(/routeFigmaWorkspaceOwnedEdit\(/g)).toHaveLength(3)
    expect(app.match(/routeFigmaWorkspaceOwnedSectionEdit\(/g))
      .toHaveLength(6)
    expect(app).not.toMatch(
      /if \(isFigmaWorkspaceNode\(workspace, nodeId\)\) \{/,
    )
    expect(app).not.toMatch(
      /if \(selectedSectionRootId === 'workspacePage'\) \{/,
    )
  })

  it('keeps the migration module package-internal', () => {
    const packageEntry = requireSource('../index.ts')

    expect(packageEntry).not.toContain("from './design-document'")
    expect(packageEntry).not.toContain("from './design-document/")
  })
})

function requireSource(path: string) {
  const source = modules[path]

  if (source === undefined) {
    throw new Error(`Missing Figma clone source: ${path}`)
  }

  return source
}
