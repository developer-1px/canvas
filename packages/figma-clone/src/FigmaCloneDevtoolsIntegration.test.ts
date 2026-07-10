import { describe, expect, it } from 'vitest'

const modules = import.meta.glob('./FigmaCloneApp.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('Figma clone editor chrome', () => {
  const source = modules['./FigmaCloneApp.tsx']

  it('keeps generic canvas devtools out of the Figma CSS editor surface', () => {
    expect(source).not.toContain('createCanvasDevtoolsFeaturePackManifest')
    expect(source).not.toContain('<CanvasDevtoolsOverlay')
    expect(source).not.toContain('createFigmaCloneDevtoolsNotes')
  })

  it('renders canonical React DOM editing without a Canvas stage slot', () => {
    expect(source).toContain('createEditorEngine')
    expect(source).toContain('createDomProjection')
    expect(source).toContain('<ReactDesignRenderer')
    expect(source).toContain('<DomEditEditorOverlay')
    expect(source).toContain('<DomEditEditorInspector')
    expect(source).not.toContain('stageOverlaySlot.render')
  })
})
