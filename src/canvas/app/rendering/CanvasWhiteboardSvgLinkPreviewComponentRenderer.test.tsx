import { CANVAS_APP_TEXT_TARGET } from '../affordances/editing/text-editor/CanvasAppTextTarget'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasWhiteboardSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasWhiteboardSvgCustomItemRendererRegistry'
import { renderCanvasWhiteboardSvgItem } from './CanvasWhiteboardSvgItemRenderer'

describe('CanvasWhiteboardSvgItemRenderer link preview components', () => {
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
      {renderCanvasWhiteboardSvgItem({
        componentPresentationRenderers:
          DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
        customItemRenderers: DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
        getComponentPresentation,
        item,
        locked: false,
        onArrowEndpointPointerDown: () => undefined,
        onItemPointerDown: () => undefined,
        canEditText: (item) => CANVAS_APP_TEXT_TARGET.canEdit(item),
        onTextDoubleClick: () => undefined,
        outlineIds: new Set(),
        selected: new Set(),
      })}
    </svg>,
  )
}
