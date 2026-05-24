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
              selectionBounds: { h: 40, w: 80, x: 32, y: 48 },
            }],
          }}
          viewport={{ scale: 2, x: 0, y: 0 }}
          onResizePointerDown={vi.fn()}
        />
      </svg>,
    )

    expect(markup).toContain('presence-overlays')
    expect(markup).toContain('presence-selection')
    expect(markup).toContain('presence-selection-rect')
    expect(markup).toContain('x="32"')
    expect(markup).toContain('width="80"')
    expect(markup).toContain('presence-cursor')
    expect(markup).toContain('translate(120 80) scale(0.5)')
    expect(markup).toContain('fill="#2563eb"')
    expect(markup).toContain('Mia')
  })

  it('renders laser pointer trails as transient overlays', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CanvasSvgInteractionOverlays
          overlays={{
            ...createOverlayState(),
            laserTrail: {
              points: [{ x: 10, y: 12 }, { x: 24, y: 32 }],
            },
          }}
          viewport={{ scale: 1, x: 0, y: 0 }}
          onResizePointerDown={vi.fn()}
        />
      </svg>,
    )

    expect(markup).toContain('laser-trail')
    expect(markup).toContain('M 10 12 L 24 32')
    expect(markup).toContain('class="laser-point"')
    expect(markup).toContain('cx="24"')
  })

  it('renders transient emote bursts at viewport-stable scale', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CanvasSvgInteractionOverlays
          overlays={{
            ...createOverlayState(),
            emoteBursts: [{
              emote: 'thumbs-up',
              id: 'emote-1',
              label: '+1',
              particles: [{ dx: -12, dy: -24 }],
              point: { x: 100, y: 120 },
            }],
          }}
          viewport={{ scale: 2, x: 0, y: 0 }}
          onResizePointerDown={vi.fn()}
        />
      </svg>,
    )

    expect(markup).toContain('emote-bursts')
    expect(markup).toContain('class="emote-burst"')
    expect(markup).toContain('data-emote="thumbs-up"')
    expect(markup).toContain('translate(100 120) scale(0.5)')
    expect(markup).toContain('+1')
  })

  it('renders ellipse draft shapes through the shared draft overlay', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CanvasSvgInteractionOverlays
          overlays={{
            ...createOverlayState(),
            draftRect: {
              h: 60,
              shape: 'ellipse',
              w: 100,
              x: 20,
              y: 30,
            },
          }}
          viewport={{ scale: 1, x: 0, y: 0 }}
          onResizePointerDown={vi.fn()}
        />
      </svg>,
    )

    expect(markup).toContain('<ellipse')
    expect(markup).toContain('class="draft-rect"')
    expect(markup).toContain('cx="70"')
    expect(markup).toContain('ry="30"')
  })

  it('renders diamond draft shapes through the shared draft overlay', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CanvasSvgInteractionOverlays
          overlays={{
            ...createOverlayState(),
            draftRect: {
              h: 60,
              shape: 'diamond',
              w: 100,
              x: 20,
              y: 30,
            },
          }}
          viewport={{ scale: 1, x: 0, y: 0 }}
          onResizePointerDown={vi.fn()}
        />
      </svg>,
    )

    expect(markup).toContain('<path')
    expect(markup).toContain('class="draft-rect"')
    expect(markup).toContain('M 70 30 L 120 60 L 70 90 L 20 60 Z')
  })
})

function createOverlayState(): CanvasOverlayState {
  return {
    alignmentGuides: [],
    draftArrow: null,
    draftRect: null,
    draftStroke: null,
    emoteBursts: [],
    grid: true,
    itemOutlineIds: new Set(),
    laserTrail: null,
    marquee: null,
    resizeHandles: [],
    selectionBounds: null,
    spacingGuides: [],
  }
}
