import { describe, expect, it } from 'vitest'

const modules = import.meta.glob('./FigmaCloneApp.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('Figma clone devtools integration', () => {
  const source = modules['./FigmaCloneApp.tsx']

  it('opts the Figma work surface into the canvas devtools pack', () => {
    expect(source).toContain('createCanvasDevtoolsFeaturePackManifest')
    expect(source).toContain('<CanvasDevtoolsOverlay')
    expect(source).toContain('createFigmaCloneDevtoolsNotes')
  })

  it('renders DOM edit and devtools overlays through one stage overlay slot', () => {
    expect(source.match(/stageOverlaySlot\.render/g) ?? []).toHaveLength(1)
    expect(source).toContain('<DomEditSelectionOverlay')
    expect(source).toContain('<CanvasDevtoolsOverlay')
  })
})
