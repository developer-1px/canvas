import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { CanvasOverlayState } from '../../engine'
import { CanvasSvgInteractionOverlays } from './CanvasSvgOverlayRenderer'

describe('CanvasSvgOverlayRenderer', () => {
  it('renders collaborator presence cursors above interaction overlays', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CanvasSvgInteractionOverlays
          overlays={{
            ...createOverlayState(),
            presence: [{
              color: '#2563eb',
              id: 'mia',
              label: 'Mia',
              point: { x: 120, y: 80 },
            }],
          }}
          viewport={{ scale: 2, x: 0, y: 0 }}
          onResizePointerDown={vi.fn()}
        />
      </svg>,
    )

    expect(markup).toContain('presence-overlays')
    expect(markup).toContain('presence-cursor')
    expect(markup).toContain('translate(120 80) scale(0.5)')
    expect(markup).toContain('fill="#2563eb"')
    expect(markup).toContain('Mia')
  })
})

function createOverlayState(): CanvasOverlayState {
  return {
    alignmentGuides: [],
    draftArrow: null,
    draftRect: null,
    draftStroke: null,
    grid: true,
    itemOutlineIds: new Set(),
    marquee: null,
    resizeHandles: [],
    selectionBounds: null,
    spacingGuides: [],
  }
}
