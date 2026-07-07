import type {
  CSSProperties,
  ReactNode,
} from 'react'
import {
  getCanvasArrowLabelBounds,
  isCanvasArrowDrawingItem,
  isCanvasPathDrawingItem,
  type ArrowItem,
  type CanvasDrawingItem,
  type CanvasPathDrawingItem,
  type CanvasStrokeDrawingItem,
} from '../../host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  createCanvasSvgArrowPathData,
  createCanvasSvgFreehandPathData,
  createCanvasSvgPathSegmentData,
} from '../../renderer'

type CanvasWhiteboardSvgDrawingItemRenderStrategy<TItem extends CanvasDrawingItem> = {
  render: (input: { item: TItem }) => ReactNode
}

export const CANVAS_WHITEBOARD_SVG_DRAWING_ITEM_RENDER_STRATEGIES = {
  arrow: {
    render: renderCanvasWhiteboardSvgArrowDrawingItem,
  },
  stroke: {
    render: renderCanvasWhiteboardSvgStrokeDrawingItem,
  },
  path: {
    render: renderCanvasWhiteboardSvgPathDrawingItem,
  },
} satisfies {
  arrow: CanvasWhiteboardSvgDrawingItemRenderStrategy<ArrowItem>
  path: CanvasWhiteboardSvgDrawingItemRenderStrategy<CanvasPathDrawingItem>
  stroke: CanvasWhiteboardSvgDrawingItemRenderStrategy<CanvasStrokeDrawingItem>
}

export function renderCanvasWhiteboardSvgDrawingItemByRoute({
  item,
}: {
  item: CanvasDrawingItem
}) {
  return isCanvasArrowDrawingItem(item)
    ? CANVAS_WHITEBOARD_SVG_DRAWING_ITEM_RENDER_STRATEGIES.arrow.render({ item })
    : isCanvasPathDrawingItem(item)
      ? CANVAS_WHITEBOARD_SVG_DRAWING_ITEM_RENDER_STRATEGIES.path.render({ item })
    : CANVAS_WHITEBOARD_SVG_DRAWING_ITEM_RENDER_STRATEGIES.stroke.render({ item })
}

function renderCanvasWhiteboardSvgArrowDrawingItem({
  item,
}: {
  item: ArrowItem
}) {
  const pathData = createCanvasSvgArrowPathData({
    end: item.end,
    routing: item.routing,
    start: item.start,
  })

  return (
    <>
      <path
        className="arrow-hit"
        d={pathData}
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="arrow-item"
        d={pathData}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
        markerEnd={
          item.arrowhead === 'none' ? undefined : CANVAS_SVG_ARROW_MARKER_IRI
        }
        opacity={item.opacity ?? 0.72}
        vectorEffect="non-scaling-stroke"
      />
      {item.text?.trim() ? renderCanvasWhiteboardSvgArrowLabel({ item }) : null}
    </>
  )
}

function renderCanvasWhiteboardSvgArrowLabel({
  item,
}: {
  item: ArrowItem
}) {
  const bounds = getCanvasArrowLabelBounds(item)

  return (
    <g className="arrow-label">
      <rect
        className="arrow-label-bg"
        x={bounds.x}
        y={bounds.y}
        width={bounds.w}
        height={bounds.h}
        rx="6"
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject
        x={bounds.x}
        y={bounds.y}
        width={bounds.w}
        height={bounds.h}
      >
        <div
          className="arrow-label-text"
          style={getCanvasWhiteboardSvgArrowLabelStyle(item)}
        >
          {item.text}
        </div>
      </foreignObject>
    </g>
  )
}

function getCanvasWhiteboardSvgArrowLabelStyle(
  item: ArrowItem,
): CSSProperties | undefined {
  if (item.fontSize === undefined && item.textAlign === undefined) {
    return undefined
  }

  return {
    fontSize: item.fontSize,
    textAlign: item.textAlign,
  }
}

function renderCanvasWhiteboardSvgStrokeDrawingItem({
  item,
}: {
  item: CanvasStrokeDrawingItem
}) {
  const pathData = createCanvasSvgFreehandPathData(item.points)

  return (
    <>
      <path
        className={`${item.type}-hit`}
        d={pathData}
        vectorEffect="non-scaling-stroke"
      />
      <path
        className={`${item.type}-item`}
        d={pathData}
        opacity={item.opacity}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </>
  )
}

function renderCanvasWhiteboardSvgPathDrawingItem({
  item,
}: {
  item: CanvasPathDrawingItem
}) {
  const pathData = createCanvasSvgPathSegmentData(item.segments)

  return (
    <>
      <path
        className="path-hit"
        d={pathData}
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="path-item"
        d={pathData}
        fill={item.fill ?? 'none'}
        opacity={item.opacity}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </>
  )
}
