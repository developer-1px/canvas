import type {
  CSSProperties,
  ReactNode,
} from 'react'
import {
  getCanvasArrowLabelBounds,
  isCanvasArrowDrawingItem,
  type ArrowItem,
  type CanvasDrawingItem,
  type CanvasStrokeDrawingItem,
} from '../../host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  createCanvasSvgArrowPathData,
  createCanvasSvgFreehandPathData,
} from '../../renderer'

type CanvasDemoSvgDrawingItemRenderStrategy<TItem extends CanvasDrawingItem> = {
  render: (input: { item: TItem }) => ReactNode
}

export const CANVAS_DEMO_SVG_DRAWING_ITEM_RENDER_STRATEGIES = {
  arrow: {
    render: renderCanvasDemoSvgArrowDrawingItem,
  },
  stroke: {
    render: renderCanvasDemoSvgStrokeDrawingItem,
  },
} satisfies {
  arrow: CanvasDemoSvgDrawingItemRenderStrategy<ArrowItem>
  stroke: CanvasDemoSvgDrawingItemRenderStrategy<CanvasStrokeDrawingItem>
}

export function renderCanvasDemoSvgDrawingItemByRoute({
  item,
}: {
  item: CanvasDrawingItem
}) {
  return isCanvasArrowDrawingItem(item)
    ? CANVAS_DEMO_SVG_DRAWING_ITEM_RENDER_STRATEGIES.arrow.render({ item })
    : CANVAS_DEMO_SVG_DRAWING_ITEM_RENDER_STRATEGIES.stroke.render({ item })
}

function renderCanvasDemoSvgArrowDrawingItem({
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
      {item.text?.trim() ? renderCanvasDemoSvgArrowLabel({ item }) : null}
    </>
  )
}

function renderCanvasDemoSvgArrowLabel({
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
          style={getCanvasDemoSvgArrowLabelStyle(item)}
        >
          {item.text}
        </div>
      </foreignObject>
    </g>
  )
}

function getCanvasDemoSvgArrowLabelStyle(
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

function renderCanvasDemoSvgStrokeDrawingItem({
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
