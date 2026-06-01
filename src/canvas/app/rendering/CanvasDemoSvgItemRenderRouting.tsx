import type {
  PointerEvent,
  ReactNode,
} from 'react'
import type {
  Bounds,
  CanvasArrowEndpoint,
  CanvasCommentItem,
  CanvasComponentItem,
  CanvasCustomItem,
  CanvasEditableTextItem,
  CanvasImageItem,
  CanvasItem,
  CanvasShapeItem,
  CanvasStampItem,
  GroupItem,
  RectItem,
  TextItem,
} from '../../entities'
import { CanvasDemoSvgComponentRenderer } from './CanvasDemoSvgComponentRenderer'
import {
  renderCanvasDemoSvgDrawingItem,
  type CanvasDemoSvgDrawingItem,
} from './CanvasDemoSvgDrawingItemRenderer'
import type { CanvasDemoSvgSelectionOutlineKind } from './CanvasDemoSvgItemFrame'
import { renderCanvasDemoSvgRectTextItem } from './CanvasDemoSvgRectTextItemRenderer'
import type { CanvasDemoSvgComponentPresentationRenderers } from './CanvasDemoSvgComponentPresentationRegistry'
import { renderCanvasDemoSvgCommentItem } from './CanvasDemoSvgCommentItemRenderer'
import type { CanvasDemoSvgCustomItemRenderers } from './CanvasDemoSvgCustomItemRendererRegistry'
import { renderCanvasDemoSvgCustomItem } from './CanvasDemoSvgCustomItemRendererExecution'
import { renderCanvasDemoSvgStampItem } from './CanvasDemoSvgStampItemRenderer'
import {
  isCanvasArrowDrawingItem,
  isCanvasEditableTextItem,
} from '../../host'

export type CanvasDemoSvgItemRenderRouteInput = {
  bounds: Bounds
  componentPresentationRenderers: CanvasDemoSvgComponentPresentationRenderers
  customItemRenderers: CanvasDemoSvgCustomItemRenderers
  getComponentPresentation: (component: string) => string
  item: CanvasItem
  locked: boolean
  onArrowEndpointPointerDown: (
    event: PointerEvent<SVGCircleElement>,
    itemId: string,
    endpoint: CanvasArrowEndpoint,
  ) => void
  onTextDoubleClick: (item: CanvasEditableTextItem) => void
  renderChild: (item: CanvasItem, locked: boolean) => ReactNode
  selected: boolean
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
  comment: renderCanvasDemoSvgCommentItemRoute,
  component: renderCanvasDemoSvgComponentItemRoute,
  custom: renderCanvasDemoSvgCustomItemRoute,
  group: renderCanvasDemoSvgGroupItemRoute,
  highlight: renderCanvasDemoSvgDrawingItemRoute,
  image: renderCanvasDemoSvgImageItemRoute,
  marker: renderCanvasDemoSvgDrawingItemRoute,
  rect: renderCanvasDemoSvgRectTextItemRoute,
  shape: renderCanvasDemoSvgRectTextItemRoute,
  stamp: renderCanvasDemoSvgStampItemRoute,
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
  onTextDoubleClick,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasComponentItem
}): CanvasDemoSvgItemRenderRoute {
  const editable = isCanvasEditableTextItem(item)

  return {
    children: renderCanvasDemoSvgOpacityGroup(item.opacity, (
      <CanvasDemoSvgComponentRenderer
        getComponentPresentation={getComponentPresentation}
        item={item}
        renderers={componentPresentationRenderers}
      />
    )),
    component: item.component,
    onDoubleClick: editable ? () => onTextDoubleClick(item) : undefined,
  }
}

function renderCanvasDemoSvgCommentItemRoute({
  item,
  onTextDoubleClick,
  selected,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasCommentItem
}): CanvasDemoSvgItemRenderRoute {
  const editable = isCanvasEditableTextItem(item)

  return {
    children: renderCanvasDemoSvgCommentItem({ item, selected }),
    onDoubleClick: editable ? () => onTextDoubleClick(item) : undefined,
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
  onArrowEndpointPointerDown,
  onTextDoubleClick,
  selected,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasDemoSvgDrawingItem
}): CanvasDemoSvgItemRenderRoute {
  const editable = isCanvasEditableTextItem(item)

  return {
    children: (
      <>
        {renderCanvasDemoSvgDrawingItem({ item })}
        {selected && isCanvasArrowDrawingItem(item) ? (
          renderCanvasDemoSvgArrowEndpointHandles({
            item,
            onArrowEndpointPointerDown,
          })
        ) : null}
      </>
    ),
    onDoubleClick: editable ? () => onTextDoubleClick(item) : undefined,
  }
}

function renderCanvasDemoSvgArrowEndpointHandles({
  item,
  onArrowEndpointPointerDown,
}: {
  item: Extract<CanvasItem, { type: 'arrow' }>
  onArrowEndpointPointerDown: (
    event: PointerEvent<SVGCircleElement>,
    itemId: string,
    endpoint: CanvasArrowEndpoint,
  ) => void
}) {
  return (
    <g className="arrow-endpoint-handles">
      {(['start', 'end'] satisfies CanvasArrowEndpoint[]).map((endpoint) => {
        const point = item[endpoint]

        return (
          <circle
            key={endpoint}
            className="arrow-endpoint-handle"
            data-endpoint={endpoint}
            cx={point.x}
            cy={point.y}
            r="6"
            vectorEffect="non-scaling-stroke"
            onPointerDown={(event) =>
              onArrowEndpointPointerDown(event, item.id, endpoint)}
          />
        )
      })}
    </g>
  )
}

function renderCanvasDemoSvgImageItemRoute({
  item,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasImageItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: (
      <>
        <image
          className="image-item"
          href={item.src}
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
          preserveAspectRatio="xMidYMid meet"
        />
        <rect
          className="image-hit"
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
        />
      </>
    ),
  }
}

function renderCanvasDemoSvgStampItemRoute({
  item,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasStampItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: renderCanvasDemoSvgStampItem({ item }),
  }
}

function renderCanvasDemoSvgRectTextItemRoute({
  item,
  onTextDoubleClick,
}: CanvasDemoSvgItemRenderRouteInput & {
  item: CanvasShapeItem | RectItem | TextItem
}): CanvasDemoSvgItemRenderRoute {
  return {
    children: renderCanvasDemoSvgRectTextItem({ item }),
    onDoubleClick: () => onTextDoubleClick(item),
  }
}

function renderCanvasDemoSvgOpacityGroup(
  opacity: number | undefined,
  children: ReactNode,
) {
  return opacity === undefined || opacity === 1
    ? children
    : <g opacity={opacity}>{children}</g>
}
