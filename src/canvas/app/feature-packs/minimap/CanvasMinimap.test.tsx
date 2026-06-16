import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasMinimap } from './CanvasMinimap'
import { getCanvasMinimapReadModel } from './CanvasMinimapModel'

describe('CanvasMinimap', () => {
  it('renders nothing without a read model', () => {
    const markup = renderToStaticMarkup(
      <CanvasMinimap model={null} onNavigateToWorldPoint={vi.fn()} />,
    )

    expect(markup).toBe('')
  })

  it('renders item bounds and the viewport overview', () => {
    const model = getCanvasMinimapReadModel({
      items: [
        { bounds: { h: 120, w: 200, x: 100, y: 80 }, id: 'card' },
        { bounds: { h: 90, w: 160, x: 520, y: 340 }, id: 'note' },
      ],
      stageRect: {
        height: 600,
        left: 0,
        top: 0,
        width: 900,
      },
      viewport: { scale: 2, x: -200, y: -100 },
    })
    const markup = renderToStaticMarkup(
      <CanvasMinimap model={model} onNavigateToWorldPoint={vi.fn()} />,
    )

    expect(markup).toContain('class="canvas-minimap"')
    expect(markup).toContain('aria-label="Canvas minimap"')
    expect(markup.match(/canvas-minimap-item/g)).toHaveLength(2)
    expect(markup).toContain('canvas-minimap-viewport')
  })
})
