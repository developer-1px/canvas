import { describe, expect, it, vi } from 'vitest'
import type { CanvasComponentItem } from '../../entities'
import { getCanvasDemoSvgItemRenderRoute } from './CanvasDemoSvgItemRenderRouting'
import { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasDemoSvgCustomItemRendererRegistry'

describe('CanvasDemoSvgItemRenderRouting', () => {
  it('routes sticky component double-clicks into text editing', () => {
    const onTextDoubleClick = vi.fn()
    const sticky = createComponentItem({ component: 'sticky' })
    const card = createComponentItem({ component: 'card' })

    const stickyRoute = getCanvasDemoSvgItemRenderRoute({
      ...createInput(sticky),
      onTextDoubleClick,
    })
    const cardRoute = getCanvasDemoSvgItemRenderRoute({
      ...createInput(card),
      onTextDoubleClick,
    })

    stickyRoute.onDoubleClick?.()
    cardRoute.onDoubleClick?.()

    expect(onTextDoubleClick).toHaveBeenCalledOnce()
    expect(onTextDoubleClick).toHaveBeenCalledWith(sticky)
    expect(cardRoute.onDoubleClick).toBeUndefined()
  })
})

function createInput(item: CanvasComponentItem) {
  return {
    bounds: item,
    componentPresentationRenderers:
      DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
    customItemRenderers: DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
    getComponentPresentation: (component: string) => component,
    item,
    locked: false,
    onArrowEndpointPointerDown: () => undefined,
    onTextDoubleClick: () => undefined,
    renderChild: () => null,
    selected: false,
  }
}

function createComponentItem(
  overrides: Partial<CanvasComponentItem> = {},
): CanvasComponentItem {
  return {
    accent: '#ca8a04',
    body: 'Decision note',
    component: 'sticky',
    fill: '#fef3c7',
    h: 148,
    id: 'component-1',
    stroke: '#eab308',
    title: 'Sticky',
    type: 'component',
    w: 188,
    x: 10,
    y: 20,
    ...overrides,
  }
}
