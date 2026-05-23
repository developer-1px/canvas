import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasDemoSvgRectTextItem } from './CanvasDemoSvgRectTextItemRenderer'
import { renderCanvasDemoSvgRectTextItem } from './CanvasDemoSvgRectTextItemRenderer'

describe('CanvasDemoSvgRectTextItemRenderer', () => {
  it('renders rect geometry and embedded text', () => {
    const markup = renderRectTextItems([
      {
        id: 'rect-1',
        type: 'rect',
        x: 20,
        y: 30,
        w: 120,
        h: 80,
        fill: '#f8fafc',
        stroke: '#334155',
        text: 'Frame',
      },
    ])

    expect(markup).toContain('class="rect-item"')
    expect(markup).toContain('x="20"')
    expect(markup).toContain('width="120"')
    expect(markup).toContain('class="canvas-text canvas-rect-text"')
    expect(markup).toContain('Frame')
  })

  it('renders text items as foreignObject text', () => {
    const markup = renderRectTextItems([
      {
        id: 'text-1',
        type: 'text',
        x: 44,
        y: 56,
        w: 140,
        h: 48,
        text: 'Label',
      },
    ])

    expect(markup).toContain('foreignObject')
    expect(markup).toContain('x="44"')
    expect(markup).toContain('height="48"')
    expect(markup).toContain('class="canvas-text"')
    expect(markup).toContain('Label')
  })
})

function renderRectTextItems(items: CanvasDemoSvgRectTextItem[]) {
  return renderToStaticMarkup(
    <svg>
      {items.map((item) => (
        <g key={item.id}>{renderCanvasDemoSvgRectTextItem({ item })}</g>
      ))}
    </svg>,
  )
}
