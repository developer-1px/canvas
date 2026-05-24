import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CanvasDemoSvgItemFrame } from './CanvasDemoSvgItemFrame'

describe('CanvasDemoSvgItemFrame', () => {
  it('owns shared item wrapper attributes and outlines', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CanvasDemoSvgItemFrame
          bounds={{ x: 10, y: 20, w: 120, h: 80 }}
          className="canvas-item canvas-group"
          itemId="group-1"
          itemType="group"
          locked
          outlined
          outlineKind="group"
          selected
          onItemPointerDown={() => undefined}
        >
          <rect className="group-hit" />
        </CanvasDemoSvgItemFrame>
      </svg>,
    )

    expect(markup).toContain('class="canvas-item canvas-group"')
    expect(markup).toContain('data-canvas-item-id="group-1"')
    expect(markup).toContain('data-locked="true"')
    expect(markup).toContain('data-selected="true"')
    expect(markup).toContain('data-type="group"')
    expect(markup).toContain('pointer-events="none"')
    expect(markup).toContain('class="item-outline group-outline"')
  })

  it('adds renderer-specific data attributes without exposing frame internals', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CanvasDemoSvgItemFrame
          bounds={{ x: 10, y: 20, w: 120, h: 80 }}
          component="sticky"
          customKind="risk"
          itemId="item-1"
          itemType="custom"
          locked={false}
          outlined={false}
          selected={false}
          onItemPointerDown={() => undefined}
        >
          <rect />
        </CanvasDemoSvgItemFrame>
      </svg>,
    )

    expect(markup).toContain('data-component="sticky"')
    expect(markup).toContain('data-custom-kind="risk"')
    expect(markup).not.toContain('item-outline')
  })
})
