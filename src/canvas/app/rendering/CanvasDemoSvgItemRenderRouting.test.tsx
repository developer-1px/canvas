import { describe, expect, it, vi } from 'vitest'
import type {
  ArrowItem,
  CanvasComponentItem,
  CanvasItem,
} from '../../entities'
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

  it('routes arrow double-clicks into connector label editing', () => {
    const onTextDoubleClick = vi.fn()
    const arrow = createArrowItem()

    const route = getCanvasDemoSvgItemRenderRoute({
      ...createInput(arrow),
      onTextDoubleClick,
    })

    route.onDoubleClick?.()

    expect(onTextDoubleClick).toHaveBeenCalledWith(arrow)
  })
})

function createInput(item: CanvasItem) {
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

function createArrowItem(overrides: Partial<ArrowItem> = {}): ArrowItem {
  return {
    end: { x: 240, y: 120 },
    h: 24,
    id: 'arrow-1',
    start: { x: 80, y: 120 },
    stroke: '#334155',
    strokeWidth: 3,
    text: 'Flow',
    type: 'arrow',
    w: 184,
    x: 68,
    y: 108,
    ...overrides,
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
