import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  isCanvasDemoSvgDrawingItem,
  renderCanvasDemoSvgDrawingItem,
} from './CanvasDemoSvgDrawingItemRenderer'

describe('CanvasDemoSvgDrawingItemRenderer', () => {
  it('identifies built-in drawing items', () => {
    expect(
      isCanvasDemoSvgDrawingItem({
        id: 'marker-1',
        type: 'marker',
        x: 8,
        y: 18,
        w: 24,
        h: 24,
        points: [{ x: 10, y: 20 }],
        opacity: 1,
        stroke: '#475569',
        strokeWidth: 4,
      }),
    ).toBe(true)

    expect(
      isCanvasDemoSvgDrawingItem({
        id: 'text-1',
        type: 'text',
        x: 8,
        y: 18,
        w: 120,
        h: 40,
        text: 'Note',
      }),
    ).toBe(false)
  })

  it('renders marker and highlighter strokes as SVG paths', () => {
    const markup = renderDrawingItems([
      {
        id: 'marker-1',
        type: 'marker',
        x: 8,
        y: 18,
        w: 24,
        h: 24,
        points: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        opacity: 1,
        stroke: '#475569',
        strokeWidth: 4,
      },
      {
        id: 'highlight-1',
        type: 'highlight',
        x: 40,
        y: 50,
        w: 60,
        h: 30,
        points: [
          { x: 42, y: 60 },
          { x: 94, y: 68 },
        ],
        opacity: 0.42,
        stroke: '#fde047',
        strokeWidth: 18,
      },
    ])

    expect(markup).toContain('class="marker-item"')
    expect(markup).toContain('d="M 10 20 L 30 40"')
    expect(markup).toContain('class="highlight-item"')
    expect(markup).toContain('d="M 42 60 L 94 68"')
  })

  it('renders arrow items as SVG lines with an arrow head marker', () => {
    const markup = renderDrawingItems([
      {
        id: 'arrow-1',
        type: 'arrow',
        x: 88,
        y: 108,
        w: 164,
        h: 44,
        start: { x: 100, y: 120 },
        end: { x: 240, y: 140 },
        stroke: '#334155',
        strokeWidth: 3,
        text: 'Next',
      },
    ])

    expect(markup).toContain('class="arrow-item"')
    expect(markup).toContain('x1="100"')
    expect(markup).toContain('y1="120"')
    expect(markup).toContain('x2="240"')
    expect(markup).toContain('y2="140"')
    expect(markup).toContain('marker-end="url(#canvas-arrow-head)"')
    expect(markup).toContain('class="arrow-label"')
    expect(markup).toContain('Next')
  })
})

function renderDrawingItems(items: CanvasItem[]) {
  return renderToStaticMarkup(
    <svg>
      {items.map((item) =>
        isCanvasDemoSvgDrawingItem(item) ? (
          <g key={item.id}>{renderCanvasDemoSvgDrawingItem({ item })}</g>
        ) : null,
      )}
    </svg>,
  )
}
