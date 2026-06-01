import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasDemoSvgCustomItemRendererRegistry'
import { renderCanvasDemoSvgItem } from './CanvasDemoSvgItemRenderer'

describe('CanvasDemoSvgItemRenderer link preview components', () => {
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
        selected: new Set(),
      })}
    </svg>,
  )
}
