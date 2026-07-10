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

  it('renders the DOM edit overlay through one stage overlay slot', () => {
    expect(source.match(/stageOverlaySlot\.render/g) ?? []).toHaveLength(1)
    expect(source).toContain('<DomEditSelectionOverlay')
  })
})
