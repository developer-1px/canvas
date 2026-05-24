import type { ReactNode } from 'react'
import type {
  Bounds,
  CanvasComponentItem,
  CanvasCustomItem,
  CanvasEditableTextItem,
  CanvasItem,
  GroupItem,
} from '../../entities'
import { CanvasDemoSvgComponentRenderer } from './CanvasDemoSvgComponentRenderer'
import {
  renderCanvasDemoSvgDrawingItem,
  type CanvasDemoSvgDrawingItem,
} from './CanvasDemoSvgDrawingItemRenderer'
import type { CanvasDemoSvgSelectionOutlineKind } from './CanvasDemoSvgItemFrame'
import { renderCanvasDemoSvgRectTextItem } from './CanvasDemoSvgRectTextItemRenderer'
import type { CanvasDemoSvgComponentPresentationRenderers } from './CanvasDemoSvgComponentPresentationRegistry'
import type { CanvasDemoSvgCustomItemRenderers } from './CanvasDemoSvgCustomItemRendererRegistry'
import { renderCanvasDemoSvgCustomItem } from './CanvasDemoSvgCustomItemRendererExecution'

export type CanvasDemoSvgItemRenderRouteInput = {
  bounds: Bounds
  componentPresentationRenderers: CanvasDemoSvgComponentPresentationRenderers
  customItemRenderers: CanvasDemoSvgCustomItemRenderers
  getComponentPresentation: (component: string) => string
  item: CanvasItem
  locked: boolean
  onTextDoubleClick: (item: CanvasEditableTextItem) => void
  renderChild: (item: CanvasItem, locked: boolean) => ReactNode
}

export type CanvasDemoSvgItemRenderRoute = {
  children: ReactNode
  className?: string
  component?: string
  customKind?: string
  onDoubleClick?: () => void
  outlineKind?: CanvasDemoSvgSelectionOutlineKind
}

type CanvasDemoSvgItemType = CanvasItem['type']

type CanvasDemoSvgItemRenderStrategy<TType extends CanvasDemoSvgItemType> = (
  input: CanvasDemoSvgItemRenderRouteInput & {
    item: Extract<CanvasItem, { type: TType }>
  },
) => CanvasDemoSvgItemRenderRoute

type CanvasDemoSvgItemRenderStrategies = {
  [TType in CanvasDemoSvgItemType]: CanvasDemoSvgItemRenderStrategy<TType>
}

const CANVAS_DEMO_SVG_ITEM_RENDER_STRATEGIES = Object.freeze({
  arrow: renderCanvasDemoSvgDrawingItemRoute,
  component: renderCanvasDemoSvgComponentItemRoute,
  custom: renderCanvasDemoSvgCustomItemRoute,
  group: renderCanvasDemoSvgGroupItemRoute,
  highlight: renderCanvasDemoSvgDrawingItemRoute,
  marker: renderCanvasDemoSvgDrawingItemRoute,
  rect: renderCanvasDemoSvgRectTextItemRoute,
  text: renderCanvasDemoSvgRectTextItemRoute,
} satisfies CanvasDemoSvgItemRenderStrategies)

export function getCanvasDemoSvgItemRenderRoute(
  input: CanvasDemoSvgItemRenderRouteInput,
): CanvasDemoSvgItemRenderRoute {
  const renderRoute = CANVAS_DEMO_SVG_ITEM_RENDER_STRATEGIES[
    input.item.type
  ] as (input: CanvasDemoSvgItemRenderRouteInput) => CanvasDemoSvgItemRenderRoute

  return renderRoute(input)
}

function renderCanvasDemoSvgGroupItemRoute({
  bounds,
  item,
  locked,
  renderChild,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: GroupItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: (
      <>
        <rect
          className="group-hit"
          x={bounds.x}
          y={bounds.y}
          width={bounds.w}
          height={bounds.h}
        />
        {item.children.map((child) => renderChild(child, locked))}
      </>
    ),
    className: 'canvas-item canvas-group',
    outlineKind: 'group',
  }
}

function renderCanvasDemoSvgComponentItemRoute({
  componentPresentationRenderers,
  getComponentPresentation,
  item,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasComponentItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: (
      <CanvasDemoSvgComponentRenderer
        getComponentPresentation={getComponentPresentation}
        item={item}
        renderers={componentPresentationRenderers}
      />
    ),
    component: item.component,
  }
}

function renderCanvasDemoSvgCustomItemRoute({
  customItemRenderers,
  item,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasCustomItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: renderCanvasDemoSvgCustomItem({
      item,
      renderers: customItemRenderers,
    }),
    customKind: item.kind,
  }
}

function renderCanvasDemoSvgDrawingItemRoute({
  item,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasDemoSvgDrawingItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: renderCanvasDemoSvgDrawingItem({ item }),
  }
}

function renderCanvasDemoSvgRectTextItemRoute({
  item,
  onTextDoubleClick,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasEditableTextItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: renderCanvasDemoSvgRectTextItem({ item }),
    onDoubleClick: () => onTextDoubleClick(item),
  }
}
