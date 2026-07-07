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
import { CanvasWhiteboardSvgComponentRenderer } from './CanvasWhiteboardSvgComponentRenderer'
import {
  renderCanvasWhiteboardSvgDrawingItem,
  type CanvasWhiteboardSvgDrawingItem,
} from './CanvasWhiteboardSvgDrawingItemRenderer'
import type { CanvasWhiteboardSvgSelectionOutlineKind } from './CanvasWhiteboardSvgItemFrame'
import { renderCanvasWhiteboardSvgRectTextItem } from './CanvasWhiteboardSvgRectTextItemRenderer'
import type { CanvasWhiteboardSvgComponentPresentationRenderers } from './CanvasWhiteboardSvgComponentPresentationRegistry'
import { renderCanvasWhiteboardSvgCommentItem } from './CanvasWhiteboardSvgCommentItemRenderer'
import type { CanvasWhiteboardSvgCustomItemRenderers } from './CanvasWhiteboardSvgCustomItemRendererRegistry'
import { renderCanvasWhiteboardSvgCustomItem } from './CanvasWhiteboardSvgCustomItemRendererExecution'
import { renderCanvasWhiteboardSvgStampItem } from './CanvasWhiteboardSvgStampItemRenderer'
import {
  isCanvasArrowDrawingItem,
  isCanvasEditableTextItem,
  isCanvasPathDrawingItem,
} from '../../host'

export type CanvasWhiteboardSvgItemRenderRouteInput = {
  bounds: Bounds
  componentPresentationRenderers: CanvasWhiteboardSvgComponentPresentationRenderers
  customItemRenderers: CanvasWhiteboardSvgCustomItemRenderers
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

export type CanvasWhiteboardSvgItemRenderRoute = {
  children: ReactNode
  className?: string
  component?: string
  customKind?: string
  onDoubleClick?: () => void
  outlineKind?: CanvasWhiteboardSvgSelectionOutlineKind
}

type CanvasWhiteboardSvgItemType = CanvasItem['type']

type CanvasWhiteboardSvgItemRenderStrategy<TType extends CanvasWhiteboardSvgItemType> = (
  input: CanvasWhiteboardSvgItemRenderRouteInput & {
    item: Extract<CanvasItem, { type: TType }>
  },
) => CanvasWhiteboardSvgItemRenderRoute

type CanvasWhiteboardSvgItemRenderStrategies = {
  [TType in CanvasWhiteboardSvgItemType]: CanvasWhiteboardSvgItemRenderStrategy<TType>
}

const CANVAS_WHITEBOARD_SVG_ITEM_RENDER_STRATEGIES = Object.freeze({
  arrow: renderCanvasWhiteboardSvgDrawingItemRoute,
  comment: renderCanvasWhiteboardSvgCommentItemRoute,
  component: renderCanvasWhiteboardSvgComponentItemRoute,
  custom: renderCanvasWhiteboardSvgCustomItemRoute,
  group: renderCanvasWhiteboardSvgGroupItemRoute,
  highlight: renderCanvasWhiteboardSvgDrawingItemRoute,
  image: renderCanvasWhiteboardSvgImageItemRoute,
  marker: renderCanvasWhiteboardSvgDrawingItemRoute,
  path: renderCanvasWhiteboardSvgDrawingItemRoute,
  rect: renderCanvasWhiteboardSvgRectTextItemRoute,
  shape: renderCanvasWhiteboardSvgRectTextItemRoute,
  stamp: renderCanvasWhiteboardSvgStampItemRoute,
  text: renderCanvasWhiteboardSvgRectTextItemRoute,
} satisfies CanvasWhiteboardSvgItemRenderStrategies)

export function getCanvasWhiteboardSvgItemRenderRoute(
  input: CanvasWhiteboardSvgItemRenderRouteInput,
): CanvasWhiteboardSvgItemRenderRoute {
  const renderRoute = CANVAS_WHITEBOARD_SVG_ITEM_RENDER_STRATEGIES[
    input.item.type
  ] as (input: CanvasWhiteboardSvgItemRenderRouteInput) => CanvasWhiteboardSvgItemRenderRoute

  return renderRoute(input)
}

function renderCanvasWhiteboardSvgGroupItemRoute({
  bounds,
  item,
  locked,
  renderChild,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: GroupItem
}): CanvasWhiteboardSvgItemRenderRoute {
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

function renderCanvasWhiteboardSvgComponentItemRoute({
  componentPresentationRenderers,
  getComponentPresentation,
  item,
  onTextDoubleClick,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: CanvasComponentItem
}): CanvasWhiteboardSvgItemRenderRoute {
  const editable = isCanvasEditableTextItem(item)

  return {
    children: renderCanvasWhiteboardSvgOpacityGroup(item.opacity, (
      <CanvasWhiteboardSvgComponentRenderer
        getComponentPresentation={getComponentPresentation}
        item={item}
        renderers={componentPresentationRenderers}
      />
    )),
    component: item.component,
    onDoubleClick: editable ? () => onTextDoubleClick(item) : undefined,
  }
}

function renderCanvasWhiteboardSvgCommentItemRoute({
  item,
  onTextDoubleClick,
  selected,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: CanvasCommentItem
}): CanvasWhiteboardSvgItemRenderRoute {
  const editable = isCanvasEditableTextItem(item)

  return {
    children: renderCanvasWhiteboardSvgCommentItem({ item, selected }),
    onDoubleClick: editable ? () => onTextDoubleClick(item) : undefined,
  }
}

function renderCanvasWhiteboardSvgCustomItemRoute({
  customItemRenderers,
  item,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: CanvasCustomItem
}): CanvasWhiteboardSvgItemRenderRoute {
  return {
    children: renderCanvasWhiteboardSvgCustomItem({
      item,
      renderers: customItemRenderers,
    }),
    customKind: item.kind,
  }
}

function renderCanvasWhiteboardSvgDrawingItemRoute({
  item,
  onArrowEndpointPointerDown,
  onTextDoubleClick,
  selected,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: CanvasWhiteboardSvgDrawingItem
}): CanvasWhiteboardSvgItemRenderRoute {
  const editable = isCanvasEditableTextItem(item)

  return {
    children: (
      <>
        {renderCanvasWhiteboardSvgDrawingItem({ item })}
        {selected && isCanvasArrowDrawingItem(item) ? (
          renderCanvasWhiteboardSvgArrowEndpointHandles({
            item,
            onArrowEndpointPointerDown,
          })
        ) : null}
        {selected && isCanvasPathDrawingItem(item) ? (
          renderCanvasWhiteboardSvgPathAnchorHandles({ item })
        ) : null}
      </>
    ),
    onDoubleClick: editable ? () => onTextDoubleClick(item) : undefined,
  }
}

function renderCanvasWhiteboardSvgArrowEndpointHandles({
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

function renderCanvasWhiteboardSvgPathAnchorHandles({
  item,
}: {
  item: Extract<CanvasItem, { type: 'path' }>
}) {
  return (
    <g className="path-anchor-handles">
      {item.segments.map((segment, index) => (
        <circle
          key={`${index}:${segment.type}`}
          className="path-anchor-handle"
          data-segment-index={index}
          data-segment-type={segment.type}
          cx={segment.point.x}
          cy={segment.point.y}
          r="4"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  )
}

function renderCanvasWhiteboardSvgImageItemRoute({
  item,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: CanvasImageItem
}): CanvasWhiteboardSvgItemRenderRoute {
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

function renderCanvasWhiteboardSvgStampItemRoute({
  item,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: CanvasStampItem
}): CanvasWhiteboardSvgItemRenderRoute {
  return {
    children: renderCanvasWhiteboardSvgStampItem({ item }),
  }
}

function renderCanvasWhiteboardSvgRectTextItemRoute({
  item,
  onTextDoubleClick,
}: CanvasWhiteboardSvgItemRenderRouteInput & {
  item: CanvasShapeItem | RectItem | TextItem
}): CanvasWhiteboardSvgItemRenderRoute {
  return {
    children: renderCanvasWhiteboardSvgRectTextItem({ item }),
    onDoubleClick: () => onTextDoubleClick(item),
  }
}

function renderCanvasWhiteboardSvgOpacityGroup(
  opacity: number | undefined,
  children: ReactNode,
) {
  return opacity === undefined || opacity === 1
    ? children
    : <g opacity={opacity}>{children}</g>
}
