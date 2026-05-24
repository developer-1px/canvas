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

  it('renders sticky notes as a single editable note body', () => {
    const markup = renderItem({
      accent: '#ca8a04',
      body: 'Decision note',
      component: 'sticky',
      fill: '#fef3c7',
      h: 148,
      id: 'component-sticky',
      stroke: '#eab308',
      title: 'Sticky',
      type: 'component',
      w: 188,
      x: 92,
      y: 88,
    }, () => 'note-card')

    expect(markup).toContain('component-sticky-note')
    expect(markup).toContain('component-sticky-text')
    expect(markup).toContain('Decision note')
    expect(markup).not.toContain('component-title')
    expect(markup).not.toContain('Sticky')
  })

  it('keeps blank quick-created sticky notes visually blank', () => {
    const markup = renderItem({
      accent: '#ca8a04',
      body: '',
      component: 'sticky',
      fill: '#fef3c7',
      h: 148,
      id: 'component-sticky',
      stroke: '#eab308',
      title: 'Sticky',
      type: 'component',
      w: 188,
      x: 92,
      y: 88,
    }, () => 'note-card')

    expect(markup).toContain('component-sticky-text')
    expect(markup).not.toContain('Sticky')
  })

  it('renders table components from their dynamic column and row data', () => {
    const markup = renderItem({
      accent: '#0891b2',
      columns: ['Name', 'Owner'],
      component: 'table',
      fill: '#ffffff',
      h: 132,
      id: 'component-table',
      items: ['Import CSV', 'Mina', 'Review', 'Ari'],
      stroke: '#cbd5e1',
      title: 'Roadmap',
      type: 'component',
      w: 224,
      x: 0,
      y: 0,
    }, () => 'matrix-table')

    expect(markup).toContain('Name')
    expect(markup).toContain('Owner')
    expect(markup).toContain('Import CSV')
    expect(markup).toContain('Review')
    expect(markup).toContain('x2="112"')
    expect(markup).toContain('y2="88"')
  })

  it('renders link preview components through their built-in presentation', () => {
    const markup = renderItem({
      accent: '#2563eb',
      body: 'https://www.figma.com/figjam/',
      component: 'link-preview',
      fill: '#ffffff',
      h: 148,
      id: 'component-link-preview',
      stroke: '#cbd5e1',
      title: 'figma.com',
      type: 'component',
      url: 'https://www.figma.com/figjam/',
      w: 320,
      x: 0,
      y: 0,
    }, () => 'missing-presentation')

    expect(markup).toContain('component-link-preview')
    expect(markup).toContain('component-link-preview-domain')
    expect(markup).toContain('figma.com')
    expect(markup).toContain('https://www.figma.com/figjam/')
  })

  it('renders vertical link preview orientation', () => {
    const markup = renderItem({
      accent: '#2563eb',
      body: 'https://www.figma.com/figjam/',
      component: 'link-preview',
      fill: '#ffffff',
      h: 260,
      id: 'component-link-preview',
      orientation: 'vertical',
      stroke: '#cbd5e1',
      title: 'figma.com',
      type: 'component',
      url: 'https://www.figma.com/figjam/',
      w: 220,
      x: 0,
      y: 0,
    }, () => 'missing-presentation')

    expect(markup).toContain('component-link-preview-card-vertical')
    expect(markup).toContain('component-link-preview-vertical')
    expect(markup).toContain('height="116"')
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
