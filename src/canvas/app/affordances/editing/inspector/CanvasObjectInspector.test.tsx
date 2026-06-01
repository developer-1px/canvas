import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasObjectInspector } from './CanvasObjectInspector'

describe('CanvasObjectInspector', () => {
  it('renders style swatches for selected object colors', () => {
    const markup = renderToStaticMarkup(
      <CanvasObjectInspector
        bounds={{ h: 40, w: 80, x: 10, y: 20 }}
        customPanels={[]}
        disabled={false}
        label="Rect"
        styleControls={[
          {
            disabled: false,
            id: 'fill',
            label: 'Fill',
            swatches: [
              { color: '#FFFFFF', selected: true },
              { color: '#C2E5FF', selected: false },
            ],
            onSelect: vi.fn(),
          },
        ]}
        onChangeBounds={vi.fn()}
      />,
    )

    expect(markup).toContain('inspector-style-controls')
    expect(markup).toContain('aria-label="Fill #FFFFFF"')
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('background-color:#FFFFFF')
  })

  it('renders custom panels alongside standard inspector chrome', () => {
    const markup = renderToStaticMarkup(
      <CanvasObjectInspector
        bounds={{ h: 40, w: 80, x: 10, y: 20 }}
        customPanels={[{
          content: <div>Styles</div>,
          id: 'custom-styles',
        }]}
        disabled={false}
        label="Custom item"
        styleControls={[
          {
            disabled: false,
            id: 'fill',
            label: 'Fill',
            swatches: [{ color: '#FFFFFF', selected: true }],
            onSelect: vi.fn(),
          },
        ]}
        onChangeBounds={vi.fn()}
      />,
    )

    expect(markup).toContain('Styles')
    expect(markup).not.toContain('object-inspector-devtools')
    expect(markup).toContain('inspector-grid')
    expect(markup).toContain('inspector-style-controls')
  })
})
