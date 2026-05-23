import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { renderCanvasDemoSvgItem } from './CanvasDemoSvgItemRenderer'
import { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasDemoSvgCustomItemRendererRegistry'

describe('CanvasDemoSvgItemRenderer', () => {
  it('renders group frames recursively and passes lock state to children', () => {
    const markup = renderItem({
      children: [
        {
          fill: '#ffffff',
          h: 40,
          id: 'rect-1',
          stroke: '#111827',
          type: 'rect',
          w: 80,
          x: 10,
          y: 20,
        },
      ],
      h: 40,
      id: 'group-1',
      locked: true,
      type: 'group',
      w: 80,
      x: 10,
      y: 20,
    })

    expect(markup).toContain('data-type="group"')
    expect(markup).toContain('class="group-hit"')
    expect(markup).toContain('data-locked="true"')
    expect(markup).toContain('data-type="rect"')
  })

  it('routes component custom drawing and rect text items through framed renderers', () => {
    const component = renderItem({
      accent: '#0f766e',
      component: 'sticky',
      fill: '#f8fafc',
      h: 80,
      id: 'component-1',
      stroke: '#0f172a',
      title: 'Component',
      type: 'component',
      w: 120,
      x: 0,
      y: 0,
    })
    const custom = renderItem({
      data: { severity: 'high' },
      h: 80,
      id: 'custom-1',
      kind: 'risk',
      presentation: 'risk-card',
      title: 'Risk',
      type: 'custom',
      w: 120,
      x: 0,
      y: 0,
    })
    const drawing = renderItem({
      h: 20,
      id: 'marker-1',
      opacity: 1,
      points: [{ x: 0, y: 0 }, { x: 20, y: 20 }],
      stroke: '#111827',
      strokeWidth: 2,
      type: 'marker',
      w: 20,
      x: 0,
      y: 0,
    })
    const rect = renderItem({
      fill: '#ffffff',
      h: 40,
      id: 'rect-1',
      stroke: '#111827',
      text: 'Rect',
      type: 'rect',
      w: 80,
      x: 10,
      y: 20,
    })

    expect(component).toContain('data-type="component"')
    expect(component).toContain('Component')
    expect(custom).toContain('data-type="custom"')
    expect(custom).toContain('data-custom-kind="risk"')
    expect(drawing).toContain('data-type="marker"')
    expect(drawing).toContain('class="marker-item"')
    expect(rect).toContain('data-type="rect"')
    expect(rect).toContain('canvas-rect-text')
  })
})

function renderItem(item: CanvasItem) {
  return renderToStaticMarkup(
    <svg>
      {renderCanvasDemoSvgItem({
        componentPresentationRenderers:
          DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
        customItemRenderers: DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
        getComponentPresentation: (component) => component,
        item,
        locked: false,
        onItemPointerDown: () => undefined,
        onTextDoubleClick: () => undefined,
        outlineIds: new Set(),
        selected: new Set(),
      })}
    </svg>,
  )
}
