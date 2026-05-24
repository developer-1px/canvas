import { describe, expect, it, vi } from 'vitest'
import type {
  ArrowItem,
  CanvasCommentItem,
  CanvasComponentItem,
  CanvasItem,
} from '../../entities'
import { getCanvasDemoSvgItemRenderRoute } from './CanvasDemoSvgItemRenderRouting'
import { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasDemoSvgCustomItemRendererRegistry'

describe('CanvasDemoSvgItemRenderRouting', () => {
  it('routes built-in editable component double-clicks into text editing', () => {
    const onTextDoubleClick = vi.fn()
    const sticky = createComponentItem({ component: 'sticky' })
    const section = createComponentItem({ component: 'section' })
    const card = createComponentItem({ component: 'card' })

    const stickyRoute = getCanvasDemoSvgItemRenderRoute({
      ...createInput(sticky),
      onTextDoubleClick,
    })
    const cardRoute = getCanvasDemoSvgItemRenderRoute({
      ...createInput(card),
      onTextDoubleClick,
    })
    const sectionRoute = getCanvasDemoSvgItemRenderRoute({
      ...createInput(section),
      onTextDoubleClick,
    })

    stickyRoute.onDoubleClick?.()
    sectionRoute.onDoubleClick?.()
    cardRoute.onDoubleClick?.()

    expect(onTextDoubleClick).toHaveBeenCalledTimes(2)
    expect(onTextDoubleClick).toHaveBeenCalledWith(sticky)
    expect(onTextDoubleClick).toHaveBeenCalledWith(section)
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

  it('routes comment double-clicks into body editing', () => {
    const onTextDoubleClick = vi.fn()
    const comment = createCommentItem()

    const route = getCanvasDemoSvgItemRenderRoute({
      ...createInput(comment),
      onTextDoubleClick,
    })

    route.onDoubleClick?.()

    expect(onTextDoubleClick).toHaveBeenCalledWith(comment)
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

function createCommentItem(
  overrides: Partial<CanvasCommentItem> = {},
): CanvasCommentItem {
  return {
    body: 'Question',
    h: 36,
    id: 'comment-1',
    type: 'comment',
    w: 36,
    x: 10,
    y: 20,
    ...overrides,
  }
}
