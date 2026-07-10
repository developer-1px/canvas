import { describe, expect, it, vi } from 'vitest'
import { projectFigmaWorkspaceDesignDocument } from './FigmaWorkspaceDesignDocumentProjection'
import { FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT } from './FigmaWorkspaceDesignDocumentSeed'
import {
  routeFigmaWorkspaceOwnedEdit,
  routeFigmaWorkspaceOwnedSectionEdit,
} from './FigmaWorkspaceEditOwnership'

describe('Figma workspace edit ownership', () => {
  const projection = projectFigmaWorkspaceDesignDocument(
    FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
  )

  it('routes workspace nodes only to the canonical writer', () => {
    const writeWorkspace = vi.fn(() => 'workspace')
    const writeLegacy = vi.fn(() => 'legacy')

    expect(routeFigmaWorkspaceOwnedEdit({
      nodeId: 'workspaceHeroTitle',
      projection,
      writeLegacy,
      writeWorkspace,
    })).toBe('workspace')
    expect(writeWorkspace).toHaveBeenCalledExactlyOnceWith(
      'workspaceHeroTitle',
    )
    expect(writeLegacy).not.toHaveBeenCalled()
  })

  it('routes non-workspace nodes only to the legacy writer', () => {
    const writeWorkspace = vi.fn(() => 'workspace')
    const writeLegacy = vi.fn(() => 'legacy')

    expect(routeFigmaWorkspaceOwnedEdit({
      nodeId: 'homeHeroTitle',
      projection,
      writeLegacy,
      writeWorkspace,
    })).toBe('legacy')
    expect(writeLegacy).toHaveBeenCalledExactlyOnceWith('homeHeroTitle')
    expect(writeWorkspace).not.toHaveBeenCalled()
  })

  it('routes workspace section edits only to the canonical writer', () => {
    const writeWorkspace = vi.fn(() => 'workspace')
    const writeLegacy = vi.fn(() => 'legacy')

    expect(routeFigmaWorkspaceOwnedSectionEdit({
      rootId: 'workspacePage',
      writeLegacy,
      writeWorkspace,
    })).toBe('workspace')
    expect(writeWorkspace).toHaveBeenCalledOnce()
    expect(writeLegacy).not.toHaveBeenCalled()
  })

  it.each(['homePage', null] as const)(
    'routes the %s section context only to the legacy writer',
    (rootId) => {
      const writeWorkspace = vi.fn(() => 'workspace')
      const writeLegacy = vi.fn(() => 'legacy')

      expect(routeFigmaWorkspaceOwnedSectionEdit({
        rootId,
        writeLegacy,
        writeWorkspace,
      })).toBe('legacy')
      expect(writeLegacy).toHaveBeenCalledOnce()
      expect(writeWorkspace).not.toHaveBeenCalled()
    },
  )
})
