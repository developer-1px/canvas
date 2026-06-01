import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { renderCanvasDemoSvgItem } from './CanvasDemoSvgItemRenderer'
import { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasDemoSvgCustomItemRendererRegistry'

describe('CanvasDemoSvgItemRenderer', () => {
  it('does not render hidden items', () => {
    const markup = renderItem({
      fill: '#ffffff',
      h: 40,
      hidden: true,
      id: 'rect-1',
      shapeType: 'rect',
      stroke: '#111827',
      type: 'shape',
      w: 80,
      x: 10,
      y: 20,
    })

    expect(markup).not.toContain('data-canvas-item-id="rect-1"')
  })

  it('renders group frames recursively and passes lock state to children', () => {
    const markup = renderItem({
      children: [
        {
          fill: '#ffffff',
          h: 40,
          id: 'rect-1',
          shapeType: 'rect',
          stroke: '#111827',
          type: 'shape',
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
    expect(markup).toContain('data-type="shape"')
    expect(markup).not.toContain('component-section')
  })


  it('routes component custom drawing and shape text items through framed renderers', () => {
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
      shapeType: 'rect',
      stroke: '#111827',
      text: 'Rect',
      type: 'shape',
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
    expect(rect).toContain('data-type="shape"')
    expect(rect).toContain('canvas-shape-text')
  })


  it('renders image items with a separate selection hit target', () => {
    const markup = renderItem({
      h: 80,
      id: 'image-1',
      mimeType: 'image/png',
      src: 'data:image/png;base64,aW1hZ2U=',
      type: 'image',
      w: 120,
      x: 10,
      y: 20,
    })

    expect(markup).toContain('data-type="image"')
    expect(markup).toContain('class="image-item"')
    expect(markup).toContain('class="image-hit"')
    expect(markup).toContain('href="data:image/png;base64,aW1hZ2U="')
  })


  it('renders stamp items with a readable label and hit target', () => {
    const markup = renderItem({
      h: 44,
      id: 'stamp-1',
      label: '+1',
      stamp: 'thumbs-up',
      type: 'stamp',
      w: 44,
      x: 10,
      y: 20,
    })

    expect(markup).toContain('data-type="stamp"')
    expect(markup).toContain('class="stamp-item"')
    expect(markup).toContain('class="stamp-hit"')
    expect(markup).toContain('+1')
  })


  it('renders comment items with a speech bubble and hit target', () => {
    const markup = renderItem({
      body: 'Needs follow-up',
      h: 36,
      id: 'comment-1',
      type: 'comment',
      w: 36,
      x: 10,
      y: 20,
    })

    expect(markup).toContain('data-type="comment"')
    expect(markup).toContain('class="comment-item"')
    expect(markup).toContain('class="comment-hit"')
    expect(markup).not.toContain('comment-body-card')
  })


  it('renders selected comment body cards', () => {
    const markup = renderItem({
      body: 'Needs follow-up',
      h: 36,
      id: 'comment-1',
      type: 'comment',
      w: 36,
      x: 10,
      y: 20,
    }, undefined, {
      selected: new Set(['comment-1']),
    })

    expect(markup).toContain('comment-body-card')
    expect(markup).toContain('Needs follow-up')
  })


  it('renders selected arrow endpoint handles', () => {
    const markup = renderItem({
      end: { x: 240, y: 140 },
      h: 44,
      id: 'arrow-1',
      start: { x: 100, y: 120 },
      stroke: '#334155',
      strokeWidth: 3,
      type: 'arrow',
      w: 164,
      x: 88,
      y: 108,
    }, undefined, {
      selected: new Set(['arrow-1']),
    })

    expect(markup).toContain('class="arrow-endpoint-handle"')
    expect(markup).toContain('data-endpoint="start"')
    expect(markup).toContain('data-endpoint="end"')
  })
})

function renderItem(
  item: CanvasItem,
  getComponentPresentation = (component: string) => component,
  options: {
    selected?: Set<string>
  } = {},
) {
  return renderToStaticMarkup(
    <svg>
      {renderCanvasDemoSvgItem({
        componentPresentationRenderers:
          DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
        customItemRenderers: DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
        getComponentPresentation,
        item,
        locked: false,
        onArrowEndpointPointerDown: () => undefined,
        onItemPointerDown: () => undefined,
        onTextDoubleClick: () => undefined,
        outlineIds: new Set(),
        selected: options.selected ?? new Set(),
      })}
    </svg>,
  )
}
