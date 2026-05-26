import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { renderCanvasDemoSvgItem } from './CanvasDemoSvgItemRenderer'
import { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasDemoSvgCustomItemRendererRegistry'

describe('CanvasDemoSvgItemRenderer built-in components', () => {
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


  it('renders checklist checked state from component data', () => {
    const markup = renderItem({
      accent: '#16a34a',
      checkedItems: [1],
      component: 'checklist',
      fill: '#ffffff',
      h: 156,
      id: 'component-checklist',
      items: ['Scope', 'Owner', 'Next'],
      stroke: '#cbd5e1',
      title: 'Checklist',
      type: 'component',
      w: 224,
      x: 0,
      y: 0,
    }, () => 'checklist-list')

    expect(markup).toContain('Scope')
    expect(markup).toContain('Owner')
    expect(markup).toContain('Next')
    expect(markup).toContain('M 21 85 L 25 89 L 31 81')
    expect(markup).not.toContain('M 21 57 L 25 61 L 31 53')
  })


  it('renders kanban cards from normalized component data', () => {
    const markup = renderItem({
      accent: '#7c3aed',
      component: 'kanban',
      fill: '#f8fafc',
      h: 190,
      id: 'component-kanban',
      items: ['', '  Doing  '],
      stroke: '#cbd5e1',
      title: 'Queue',
      type: 'component',
      w: 214,
      x: 0,
      y: 0,
    }, () => 'kanban-stack')

    expect(markup).toContain('Queue')
    expect(markup).toContain('New card')
    expect(markup).toContain('Doing')
    expect(markup).toContain('width="186"')
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

