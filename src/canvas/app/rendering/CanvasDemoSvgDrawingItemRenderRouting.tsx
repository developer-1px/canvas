import type { ReactNode } from 'react'
import {
  isCanvasArrowDrawingItem,
  type ArrowItem,
  type CanvasDrawingItem,
  type CanvasStrokeDrawingItem,
} from '../../host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  createCanvasSvgPathData,
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
  return (
    <>
      <line
        className="arrow-hit"
        x1={item.start.x}
        y1={item.start.y}
        x2={item.end.x}
        y2={item.end.y}
        vectorEffect="non-scaling-stroke"
      />
      <line
        className="arrow-item"
        x1={item.start.x}
        y1={item.start.y}
        x2={item.end.x}
        y2={item.end.y}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
        markerEnd={CANVAS_SVG_ARROW_MARKER_IRI}
        vectorEffect="non-scaling-stroke"
      />
    </>
  )
}

function renderCanvasDemoSvgStrokeDrawingItem({
  item,
}: {
  item: CanvasStrokeDrawingItem
}) {
  const pathData = createCanvasSvgPathData(item.points)

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
