import { createCanvasAppTextTarget } from '../affordances/editing/text-editor/CanvasAppTextTarget'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type {
  ArrowItem,
  CanvasCommentItem,
  CanvasComponentItem,
  CanvasItem,
} from '../../entities'
import { getCanvasWhiteboardSvgItemRenderRoute } from './CanvasWhiteboardSvgItemRenderRouting'
import { DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasWhiteboardSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasWhiteboardSvgCustomItemRendererRegistry'
import { CANVAS_STICKY_NOTE_EXTENSION } from '../../foundation'
import {
  CANVAS_APP_STICKY_NOTE_CAPABILITY_ADAPTER,
  compileCanvasAppFoundationExtensions,
} from '../extensions/foundation-extensions'

const foundationRuntime = compileCanvasAppFoundationExtensions({
  adapters: [CANVAS_APP_STICKY_NOTE_CAPABILITY_ADAPTER],
  extensions: [CANVAS_STICKY_NOTE_EXTENSION],
})
const textTarget = createCanvasAppTextTarget({}, foundationRuntime.textTargets)

describe('CanvasWhiteboardSvgItemRenderRouting', () => {
  it('routes built-in editable component double-clicks into text editing', () => {
    const onTextDoubleClick = vi.fn()
    const sticky = createComponentItem({ component: 'sticky' })
    const section = createComponentItem({ component: 'section' })
    const card = createComponentItem({ component: 'card' })

    const stickyRoute = getCanvasWhiteboardSvgItemRenderRoute({
      ...createInput(sticky),
      canEditText: (item: CanvasItem) => textTarget.canEdit(item),
      onTextDoubleClick,
    })
    const cardRoute = getCanvasWhiteboardSvgItemRenderRoute({
      ...createInput(card),
      canEditText: (item: CanvasItem) => textTarget.canEdit(item),
      onTextDoubleClick,
    })
    const sectionRoute = getCanvasWhiteboardSvgItemRenderRoute({
      ...createInput(section),
      canEditText: (item: CanvasItem) => textTarget.canEdit(item),
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

    const route = getCanvasWhiteboardSvgItemRenderRoute({
      ...createInput(arrow),
      canEditText: (item: CanvasItem) => textTarget.canEdit(item),
      onTextDoubleClick,
    })

    route.onDoubleClick?.()

    expect(onTextDoubleClick).toHaveBeenCalledWith(arrow)
  })

  it('routes comment double-clicks into body editing', () => {
    const onTextDoubleClick = vi.fn()
    const comment = createCommentItem()

    const route = getCanvasWhiteboardSvgItemRenderRoute({
      ...createInput(comment),
      canEditText: (item: CanvasItem) => textTarget.canEdit(item),
      onTextDoubleClick,
    })

    route.onDoubleClick?.()

    expect(onTextDoubleClick).toHaveBeenCalledWith(comment)
  })

  it('does not expose a double-click editor when text authority denies it', () => {
    const item: CanvasItem = {
      h: 40,
      id: 'text-1',
      text: 'Locked by authority',
      type: 'text',
      w: 120,
      x: 0,
      y: 0,
    }
    const route = getCanvasWhiteboardSvgItemRenderRoute({
      ...createInput(item),
      canEditText: () => false,
    })

    expect(route.onDoubleClick).toBeUndefined()
  })

  it('shows path anchor handles only while a path item is selected', () => {
    const path: CanvasItem = {
      h: 74,
      id: 'path-1',
      opacity: 1,
      segments: [
        { point: { x: 20, y: 40 }, type: 'move' },
        {
          control1: { x: 50, y: 20 },
          control2: { x: 70, y: 90 },
          point: { x: 110, y: 60 },
          type: 'cubic',
        },
      ],
      stroke: '#334155',
      strokeWidth: 4,
      type: 'path',
      w: 94,
      x: 18,
      y: 18,
    }

    const route = getCanvasWhiteboardSvgItemRenderRoute({
      ...createInput(path),
      selected: true,
    })
    const markup = renderToStaticMarkup(<svg>{route.children}</svg>)

    expect(markup).toContain('class="path-anchor-handles"')
    expect(markup).toContain('data-segment-type="move"')
    expect(markup).toContain('data-segment-type="cubic"')
  })
})

function createInput(item: CanvasItem) {
  return {
    bounds: item,
    componentPresentationRenderers: {
      ...DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
      ...foundationRuntime.componentPresentationRenderers,
    },
    customItemRenderers: DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
    getComponentPresentation: (component: string) => component,
    item,
    locked: false,
    onArrowEndpointPointerDown: () => undefined,
    canEditText: (item: CanvasItem) => textTarget.canEdit(item),
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
